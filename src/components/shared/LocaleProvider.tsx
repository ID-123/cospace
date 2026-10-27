'use client';

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const translations = {
  es: {
    language: 'Idioma',
    navigation: 'Navegación principal',
    spanish: 'Español',
    english: 'Inglés',
    navHome: 'Inicio',
    navSpaces: 'Espacios',
    navAdmin: 'Dashboard',
    navReservations: 'Mis reservas',
    login: 'Iniciar sesión',
    register: 'Regístrate',
    logout: 'Cerrar sesión',
    loggingOut: 'Cerrando...',
    logoutError: 'No se pudo cerrar sesión. Inténtalo de nuevo.',
    connectionError: 'No fue posible conectar con el servidor.',
    footerTagline: 'Encuentra tu espacio ideal.',
    homeEyebrow: 'TU PRÓXIMA IDEA EMPIEZA AQUÍ',
    homeTitle: 'Encuentra tu lugar',
    homeTitleAccent: 'para crear.',
    homeDescription:
      'Espacios de coworking pensados para concentrarte, colaborar y hacer que las cosas sucedan. Reserva por horas, a tu manera.',
    exploreSpaces: 'Explorar espacios',
    createAccount: 'Crear una cuenta',
    homeSectionEyebrow: 'ENCUENTRA TU RITMO',
    homeSectionTitle: 'Un espacio para cada idea',
    seeAllSpaces: 'Ver todos los espacios',
    homeSpaceDesk: 'Escritorios',
    homeSpaceDeskDescription: 'Un lugar cómodo para concentrarte y avanzar.',
    homeSpaceMeeting: 'Salas de reuniones',
    homeSpaceMeetingDescription:
      'Espacios para compartir ideas y trabajar en equipo.',
    homeSpaceBooth: 'Cabinas',
    homeSpaceBoothDescription: 'Privacidad y calma para tus llamadas y tareas.',
    homeVisualNote: 'UN ESPACIO PARA CADA MOMENTO',
    spacesTitle: 'Espacios disponibles',
    searchSpaces: 'Buscar espacios',
    searchSpacesPlaceholder: 'Busca por nombre, tipo o descripción',
    noMatchingSpaces: 'No encontramos espacios con esa búsqueda.',
    loadingSpaces: 'Cargando espacios...',
    loadingSpaceDetails: 'Cargando detalles del espacio...',
    noSpaces: 'No hay espacios disponibles.',
    availableSpace: 'ESPACIO DISPONIBLE',
    capacity: 'Capacidad',
    person: 'persona',
    people: 'personas',
    hourlyPrice: 'Precio por hora',
    viewDetails: 'Ver detalles',
    spaceImage: 'Espacio de coworking',
    backToSpaces: 'Volver a los espacios',
    bookSpace: 'Reserva este espacio',
    reserve: 'Reservar espacio',
    booking: 'Reservando...',
    date: 'Fecha',
    startTimeBogota: 'Hora de inicio (Bogotá)',
    duration: 'Duración',
    hour: 'hora',
    hours: 'horas',
    invalidDate: 'Selecciona una fecha válida.',
    createReservationError: 'No se pudo crear la reserva.',
    authRequired: 'Inicia sesión para reservar.',
    loginTitle: 'Qué bueno verte',
    loginEyebrow: 'TU ESPACIO TE ESPERA',
    registerTitle: 'Tu próxima jornada empieza aquí',
    registerEyebrow: 'ÚNETE A COSPACE',
    email: 'Correo electrónico',
    password: 'Contraseña',
    passwordPlaceholder: 'Tu contraseña',
    passwordInputHint: 'Al menos 8 caracteres',
    emailPlaceholder: 'tu@correo.com',
    submitting: 'Un momento...',
    loginSubmit: 'Iniciar sesión',
    firstName: 'Nombres',
    lastName: 'Apellidos',
    phone: 'Teléfono',
    firstNamePlaceholder: 'Tus nombres',
    lastNamePlaceholder: 'Tus apellidos',
    passwordHelp: 'Usa al menos 8 caracteres para proteger tu cuenta.',
    confirmPassword: 'Confirmar contraseña',
    confirmPasswordPlaceholder: 'Escríbela nuevamente',
    registerSubmit: 'Crear cuenta',
    alreadyAccount: '¿Ya tienes una cuenta?',
    noAccount: '¿Aún no tienes una cuenta?',
    signInLink: 'Inicia sesión',
    createAccountLink: 'Crea una cuenta',
    backExplore: 'Explorar espacios',
    accountEyebrow: 'TU CUENTA',
    reservationsTitle: 'Mis reservas',
    greeting: 'Hola',
    editProfile: 'Editar perfil y contraseña',
    profileTitle: 'Mi perfil',
    personalDetails: 'Datos personales',
    changePassword: 'Cambiar contraseña',
    currentPassword: 'Contraseña actual',
    newPassword: 'Nueva contraseña',
    updatePassword: 'Actualizar contraseña',
    profileSaved: 'Tus datos se actualizaron correctamente.',
    profileSaveFailed: 'No se pudieron actualizar tus datos.',
    invalidCurrentPassword: 'La contraseña actual no es correcta.',
    passwordUpdated: 'Contraseña actualizada. Tu sesión sigue activa.',
    passwordChangeFailed: 'No se pudo actualizar la contraseña.',
    reservationsIntro: 'Aquí podrás consultar y gestionar tus reservas.',
    loadingReservations: 'Cargando tus reservas...',
    noReservations:
      'Todavía no tienes reservas. Explora los espacios disponibles para encontrar el ideal para ti.',
    confirmed: 'Confirmada',
    cancelled: 'Cancelada',
    cancelReservation: 'Cancelar',
    cancelReservationError: 'No se pudo cancelar la reserva.',
    adminEyebrow: 'PANEL DE ADMINISTRACIÓN',
    spaceManagement: 'Gestión de espacios',
    createSpace: 'Crear espacio',
    editSpace: 'Editar espacio',
    spaceName: 'Nombre',
    description: 'Descripción',
    type: 'Tipo',
    desk: 'Escritorio',
    meetingRoom: 'Sala de reuniones',
    booth: 'Cabina',
    saveChanges: 'Guardar cambios',
    cancelEdit: 'Cancelar edición',
    saving: 'Guardando...',
    spaceCreated: 'Espacio creado correctamente.',
    changesSaved: 'Cambios guardados.',
    registeredSpaces: 'Espacios registrados',
    loadingAdminSpaces: 'Cargando espacios...',
    noRegisteredSpaces: 'Aún no hay espacios registrados.',
    active: 'Activo',
    inactive: 'Inactivo',
    edit: 'Editar',
    deactivate: 'Desactivar',
    activate: 'Activar',
    spaceDeactivated: 'Espacio desactivado.',
    spaceActivated: 'Espacio activado.',
    saveSpaceError: 'No se pudo guardar el espacio.',
    updateSpaceError: 'No se pudo actualizar el espacio.',
    loadSpacesError: 'No se pudieron cargar los espacios.',
    loadReservationsError: 'No se pudieron cargar las reservas.',
    perHour: 'por hora',
    scheduleRuleError: 'El horario no cumple las reglas de reserva.',
    spaceUnavailable: 'El espacio ya está reservado en ese horario.',
    userScheduleConflict: 'Ya tienes otra reserva en ese horario.',
    reservationLimit: 'Ya tienes 3 reservas futuras confirmadas.',
    spaceNotFound: 'El espacio no está disponible.',
    cancellationWindowClosed: 'Solo puedes cancelar hasta 2 horas antes.',
    reservationNotConfirmed: 'La reserva ya está cancelada.',
    reservationNotFound: 'No se encontró esa reserva.',
    emailInUse: 'El correo ya está registrado.',
    invalidCredentials: 'Credenciales incorrectas.',
    requestFailed: 'No se pudo completar la solicitud. Inténtalo de nuevo.',
    invalidInput: 'Revisa los datos ingresados.',
    futureSpaceReservations:
      'No se puede desactivar un espacio con reservas futuras confirmadas.',
    adminForbidden: 'Solo un administrador puede gestionar espacios.',
    unauthenticated: 'Inicia sesión para continuar.',
    reservationDuration: 'Reserva de {hours} h',
  },
  en: {
    language: 'Language',
    navigation: 'Main navigation',
    spanish: 'Spanish',
    english: 'English',
    navHome: 'Home',
    navSpaces: 'Spaces',
    navAdmin: 'Dashboard',
    navReservations: 'My bookings',
    login: 'Sign in',
    register: 'Create account',
    logout: 'Sign out',
    loggingOut: 'Signing out...',
    logoutError: 'Could not sign out. Please try again.',
    connectionError: 'Could not connect to the server.',
    footerTagline: 'Find your ideal workspace.',
    homeEyebrow: 'YOUR NEXT IDEA STARTS HERE',
    homeTitle: 'Find your place',
    homeTitleAccent: 'to create.',
    homeDescription:
      'Coworking spaces designed to help you focus, collaborate, and get things done. Book by the hour, your way.',
    exploreSpaces: 'Explore spaces',
    createAccount: 'Create an account',
    homeSectionEyebrow: 'FIND YOUR RHYTHM',
    homeSectionTitle: 'A space for every idea',
    seeAllSpaces: 'View all spaces',
    homeSpaceDesk: 'Desks',
    homeSpaceDeskDescription: 'A comfortable place to focus and make progress.',
    homeSpaceMeeting: 'Meeting rooms',
    homeSpaceMeetingDescription: 'Spaces to share ideas and work as a team.',
    homeSpaceBooth: 'Booths',
    homeSpaceBoothDescription: 'Privacy and quiet for calls and focused work.',
    homeVisualNote: 'A SPACE FOR EVERY MOMENT',
    spacesTitle: 'Available spaces',
    searchSpaces: 'Search spaces',
    searchSpacesPlaceholder: 'Search by name, type, or description',
    noMatchingSpaces: 'No spaces match your search.',
    loadingSpaces: 'Loading spaces...',
    loadingSpaceDetails: 'Loading space details...',
    noSpaces: 'No spaces are currently available.',
    availableSpace: 'AVAILABLE SPACE',
    capacity: 'Capacity',
    person: 'person',
    people: 'people',
    hourlyPrice: 'Hourly price',
    viewDetails: 'View details',
    spaceImage: 'Coworking space',
    backToSpaces: 'Back to spaces',
    bookSpace: 'Book this space',
    reserve: 'Book space',
    booking: 'Booking...',
    date: 'Date',
    startTimeBogota: 'Start time (Bogotá)',
    duration: 'Duration',
    hour: 'hour',
    hours: 'hours',
    invalidDate: 'Choose a valid date.',
    createReservationError: 'Could not create the booking.',
    authRequired: 'Sign in to book a space.',
    loginTitle: 'Welcome back',
    loginEyebrow: 'YOUR SPACE IS WAITING',
    registerTitle: 'Your next workday starts here',
    registerEyebrow: 'JOIN COSPACE',
    email: 'Email address',
    password: 'Password',
    passwordPlaceholder: 'Your password',
    passwordInputHint: 'At least 8 characters',
    emailPlaceholder: 'you@example.com',
    submitting: 'Please wait...',
    loginSubmit: 'Sign in',
    firstName: 'First name',
    lastName: 'Last name',
    phone: 'Phone',
    firstNamePlaceholder: 'Your first name',
    lastNamePlaceholder: 'Your last name',
    passwordHelp: 'Use at least 8 characters to protect your account.',
    confirmPassword: 'Confirm password',
    confirmPasswordPlaceholder: 'Enter it again',
    registerSubmit: 'Create account',
    alreadyAccount: 'Already have an account?',
    noAccount: 'Don’t have an account yet?',
    signInLink: 'Sign in',
    createAccountLink: 'Create an account',
    backExplore: 'Explore spaces',
    accountEyebrow: 'YOUR ACCOUNT',
    reservationsTitle: 'My bookings',
    greeting: 'Hello',
    editProfile: 'Edit profile and password',
    profileTitle: 'My profile',
    personalDetails: 'Personal details',
    changePassword: 'Change password',
    currentPassword: 'Current password',
    newPassword: 'New password',
    updatePassword: 'Update password',
    profileSaved: 'Your details were updated successfully.',
    profileSaveFailed: 'Could not update your details.',
    invalidCurrentPassword: 'The current password is incorrect.',
    passwordUpdated: 'Password updated. Your session is still active.',
    passwordChangeFailed: 'Could not update your password.',
    reservationsIntro: 'View and manage your bookings here.',
    loadingReservations: 'Loading your bookings...',
    noReservations:
      'You have no bookings yet. Explore the available spaces to find the right one.',
    confirmed: 'Confirmed',
    cancelled: 'Cancelled',
    cancelReservation: 'Cancel',
    cancelReservationError: 'Could not cancel the booking.',
    adminEyebrow: 'ADMIN PANEL',
    spaceManagement: 'Space management',
    createSpace: 'Create space',
    editSpace: 'Edit space',
    spaceName: 'Name',
    description: 'Description',
    type: 'Type',
    desk: 'Desk',
    meetingRoom: 'Meeting room',
    booth: 'Booth',
    saveChanges: 'Save changes',
    cancelEdit: 'Cancel editing',
    saving: 'Saving...',
    spaceCreated: 'Space created successfully.',
    changesSaved: 'Changes saved.',
    registeredSpaces: 'Registered spaces',
    loadingAdminSpaces: 'Loading spaces...',
    noRegisteredSpaces: 'No spaces have been registered yet.',
    active: 'Active',
    inactive: 'Inactive',
    edit: 'Edit',
    deactivate: 'Deactivate',
    activate: 'Activate',
    spaceDeactivated: 'Space deactivated.',
    spaceActivated: 'Space activated.',
    saveSpaceError: 'Could not save the space.',
    updateSpaceError: 'Could not update the space.',
    loadSpacesError: 'Could not load spaces.',
    loadReservationsError: 'Could not load bookings.',
    perHour: 'per hour',
    scheduleRuleError: 'The booking time does not meet the booking rules.',
    spaceUnavailable: 'The space is already booked for that time.',
    userScheduleConflict: 'You already have another booking at that time.',
    reservationLimit: 'You already have 3 confirmed future bookings.',
    spaceNotFound: 'The space is unavailable.',
    cancellationWindowClosed: 'You can only cancel up to 2 hours before start.',
    reservationNotConfirmed: 'This booking has already been cancelled.',
    reservationNotFound: 'The booking could not be found.',
    emailInUse: 'This email is already registered.',
    invalidCredentials: 'Incorrect email or password.',
    requestFailed: 'Could not complete the request. Please try again.',
    invalidInput: 'Check the information you entered.',
    futureSpaceReservations:
      'A space with confirmed future bookings cannot be deactivated.',
    adminForbidden: 'Only an administrator can manage spaces.',
    unauthenticated: 'Sign in to continue.',
    reservationDuration: 'Booking for {hours} h',
  },
} as const;

export type TranslationKey = keyof typeof translations.es;
type Locale = keyof typeof translations;

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
    document.cookie = `cospace_locale=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }, []);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: (key: TranslationKey) => translations[locale][key],
    }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return context;
}

export function LocaleSwitcher() {
  const { locale, setLocale, t } = useLocale();

  return (
    <label className="locale-switcher">
      <span className="visually-hidden">{t('language')}</span>
      <select
        aria-label={t('language')}
        value={locale}
        onChange={(event) =>
          setLocale(event.currentTarget.value === 'en' ? 'en' : 'es')
        }
      >
        <option value="es">{t('spanish')}</option>
        <option value="en">{t('english')}</option>
      </select>
    </label>
  );
}
