"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type SubmitEvent,
} from "react";
import { useLocale } from "@/components/shared/LocaleProvider";
import { LocalizedPrice } from "@/components/shared/LocalizedPrice";

type Space = {
  id: string;
  name: string;
  description: string;
  type: "desk" | "meeting_room" | "booth";
  capacity: number;
  pricePerHour: number;
  isActive: boolean;
};

type ApiError = {
  error?: {
    code?: string;
    message?: string;
  };
};

type SpacesLoadResult =
  { spaces: Space[]; error: null } | { spaces: null; error: string };

const emptySpace = {
  name: "",
  description: "",
  type: "desk" as const,
  capacity: 1,
  pricePerHour: 1,
};

export function SpaceManagement() {
  const { t } = useLocale();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [editingSpace, setEditingSpace] = useState<Space | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [mutatingSpaceIds, setMutatingSpaceIds] = useState<Set<string>>(
    new Set(),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [visibleCount, setVisibleCount] = useState(5);
  const formRef = useRef<HTMLFormElement>(null);
  const listEndRef = useRef<HTMLDivElement>(null);

  const fetchSpaces = useCallback(async (): Promise<SpacesLoadResult> => {
    try {
      const response = await fetch("/api/admin/spaces");
      if (!response.ok) {
        const result = (await response.json()) as ApiError;
        return {
          spaces: null,
          error:
            result.error?.code === "FORBIDDEN"
              ? t("adminForbidden")
              : result.error?.code === "UNAUTHENTICATED"
                ? t("unauthenticated")
                : result.error?.code === "INTERNAL_ERROR"
                  ? t("loadSpacesError")
                  : (result.error?.message ?? t("loadSpacesError")),
        };
      }
      return { spaces: (await response.json()) as Space[], error: null };
    } catch {
      return { spaces: null, error: t("connectionError") };
    }
  }, [t]);

  const loadSpaces = useCallback(async () => {
    setErrorMessage("");
    const result = await fetchSpaces();
    if (result.error !== null) setErrorMessage(result.error);
    else setSpaces(result.spaces);
    setIsLoading(false);
  }, [fetchSpaces]);

  useEffect(() => {
    let isMounted = true;
    void fetchSpaces().then((result) => {
      if (!isMounted) return;
      if (result.error !== null) setErrorMessage(result.error);
      else setSpaces(result.spaces);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [fetchSpaces]);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) return;
    setErrorMessage("");
    setSuccessMessage("");

    const formData = new FormData(event.currentTarget);
    const spaceData = {
      name: String(formData.get("name") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim(),
      type: String(formData.get("type")),
      capacity: Number(formData.get("capacity")),
      pricePerHour: Number(formData.get("pricePerHour")),
    };

    if (!spaceData.name || !spaceData.description) {
      setErrorMessage(t("invalidInput"));
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        editingSpace ? `/api/spaces/${editingSpace.id}` : "/api/spaces",
        {
          method: editingSpace ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(spaceData),
        },
      );

      if (!response.ok) {
        const result = (await response.json()) as ApiError;
        setErrorMessage(
          result.error?.code === "FORBIDDEN"
            ? t("adminForbidden")
            : result.error?.code === "UNAUTHENTICATED"
              ? t("unauthenticated")
              : result.error?.code === "INVALID_INPUT"
                ? t("invalidInput")
                : (result.error?.message ?? t("saveSpaceError")),
        );
        return;
      }

      setEditingSpace(null);
      setSuccessMessage(editingSpace ? t("changesSaved") : t("spaceCreated"));
      await loadSpaces();
    } catch {
      setErrorMessage(t("connectionError"));
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleActive(space: Space) {
    if (mutatingSpaceIds.has(space.id)) return;

    setMutatingSpaceIds((current) => new Set(current).add(space.id));
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const response = await fetch(`/api/spaces/${space.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !space.isActive }),
      });

      if (!response.ok) {
        const result = (await response.json()) as ApiError;
        setErrorMessage(
          result.error?.code === "SPACE_HAS_FUTURE_RESERVATIONS"
            ? t("futureSpaceReservations")
            : result.error?.code === "FORBIDDEN"
              ? t("adminForbidden")
              : (result.error?.message ?? t("updateSpaceError")),
        );
        return;
      }

      setSuccessMessage(
        space.isActive ? t("spaceDeactivated") : t("spaceActivated"),
      );
      await loadSpaces();
    } catch {
      setErrorMessage(t("connectionError"));
    } finally {
      setMutatingSpaceIds((current) => {
        const next = new Set(current);
        next.delete(space.id);
        return next;
      });
    }
  }

  const filteredSpaces = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    return spaces.filter((space) => {
      const matchesName =
        !query || space.name.toLocaleLowerCase().includes(query);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? space.isActive : !space.isActive);
      return matchesName && matchesStatus;
    });
  }, [searchQuery, spaces, statusFilter]);

  const visibleSpaces = filteredSpaces.slice(0, visibleCount);
  const formSpace = editingSpace ?? emptySpace;

  useEffect(() => {
    const target = listEndRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((count) =>
            Math.min(count + 5, filteredSpaces.length),
          );
        }
      },
      { rootMargin: "80px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [filteredSpaces.length, visibleCount]);

  function startEditing(space: Space) {
    setEditingSpace(space);
    setErrorMessage("");
    setSuccessMessage("");
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      const input = formRef.current?.elements.namedItem(
        "name",
      ) as HTMLInputElement | null;
      input?.focus();
    });
  }

  return (
    <section className="space-management" aria-label={t("spaceManagement")}>
      <div className="space-management__toolbar">
        <h2>{t("registeredSpaces")}</h2>
        <div className="space-management__toolbar-controls">
          <label className="space-management__search">
            <span className="visually-hidden">{t("searchSpaces")}</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.currentTarget.value);
                setVisibleCount(5);
              }}
              placeholder={t("searchSpacesPlaceholder")}
            />
          </label>
          <div
            className="space-management__filters"
            aria-label={t("filterSpaces")}
          >
            {(["all", "active", "inactive"] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                className={`space-management__filter${statusFilter === filter ? " is-selected" : ""}`}
                aria-pressed={statusFilter === filter}
                onClick={() => {
                  setStatusFilter(filter);
                  setVisibleCount(5);
                }}
              >
                {filter === "all"
                  ? t("allSpaces")
                  : filter === "active"
                    ? t("active")
                    : t("inactive")}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="space-management__columns">
        <form
          ref={formRef}
          key={editingSpace?.id ?? "new-space"}
          className="space-management__form"
          onSubmit={handleSubmit}
        >
          <h2>{editingSpace ? t("editSpace") : t("createSpace")}</h2>
          <label>
            {t("spaceName")}
            <input
              name="name"
              defaultValue={formSpace.name}
              minLength={2}
              maxLength={100}
              required
            />
          </label>
          <label>
            {t("description")}
            <textarea
              name="description"
              defaultValue={formSpace.description}
              maxLength={255}
              rows={3}
              required
            />
          </label>
          <div className="space-management__form-row">
            <label>
              {t("type")}
              <select name="type" defaultValue={formSpace.type} required>
                <option value="desk">{t("desk")}</option>
                <option value="meeting_room">{t("meetingRoom")}</option>
                <option value="booth">{t("booth")}</option>
              </select>
            </label>
            <label>
              {t("capacity")}
              <input
                name="capacity"
                type="number"
                min={1}
                max={500}
                defaultValue={formSpace.capacity}
                required
              />
            </label>
            <label>
              {t("hourlyPrice")}
              <input
                name="pricePerHour"
                type="number"
                min={1}
                max={536_870_911}
                step={1}
                defaultValue={formSpace.pricePerHour}
                required
              />
            </label>
          </div>
          {errorMessage ? (
            <p className="auth-form__error" role="alert">
              {errorMessage}
            </p>
          ) : null}
          {successMessage ? (
            <p className="space-management__success" role="status">
              {successMessage}
            </p>
          ) : null}
          <div className="space-management__form-actions">
            <button
              className="auth-form__submit"
              type="submit"
              disabled={isSaving}
            >
              {isSaving
                ? t("saving")
                : editingSpace
                  ? t("saveChanges")
                  : t("createSpace")}
            </button>
            {editingSpace ? (
              <button
                className="space-management__secondary"
                type="button"
                onClick={() => setEditingSpace(null)}
              >
                {t("cancelEdit")}
              </button>
            ) : null}
          </div>
        </form>

        <div className="space-management__list">
          {isLoading ? <p>{t("loadingAdminSpaces")}</p> : null}
          {!isLoading && filteredSpaces.length === 0 ? (
            <p className="account-page__empty">{t("noRegisteredSpaces")}</p>
          ) : null}
          <div className="space-management__list-scroll">
            {visibleSpaces.map((space) => (
              <article
                className={`space-management__item${editingSpace?.id === space.id ? " is-editing" : ""}`}
                key={space.id}
              >
                <div className="space-management__details">
                  <div>
                    <h3>{space.name}</h3>
                    <span
                      className={`space-management__status${space.isActive ? " is-active" : ""}`}
                    >
                      {space.isActive ? t("active") : t("inactive")}
                    </span>
                  </div>
                  <p>{space.description}</p>
                  <p>
                    {t(
                      space.type === "desk"
                        ? "desk"
                        : space.type === "meeting_room"
                          ? "meetingRoom"
                          : "booth",
                    )}{" "}
                    · {space.capacity}{" "}
                    {space.capacity === 1 ? t("person") : t("people")} · $
                    <LocalizedPrice amount={space.pricePerHour} />{" "}
                    {t("perHour")}
                  </p>
                </div>
                <div className="space-management__item-actions">
                  <button
                    className="space-management__secondary"
                    type="button"
                    onClick={() => startEditing(space)}
                  >
                    {t("edit")}
                  </button>
                  <button
                    className="space-management__secondary"
                    type="button"
                    disabled={mutatingSpaceIds.has(space.id)}
                    onClick={() => void toggleActive(space)}
                  >
                    {mutatingSpaceIds.has(space.id)
                      ? t("saving")
                      : space.isActive
                        ? t("deactivate")
                        : t("activate")}
                  </button>
                </div>
              </article>
            ))}
            <div ref={listEndRef} aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
