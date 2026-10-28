import { Migration } from "@mikro-orm/migrations";

export class Migration20261027122300 extends Migration {
  override name = "Migration20261027122300";

  override up(): void | Promise<void> {
    this.addSql(
      `create table "space" ("id" uuid not null, "name" varchar(255) not null, "description" varchar(255) not null, "type" text not null, "capacity" int not null, "price_per_hour" int not null, "is_active" boolean not null default true, "created_at" timestamptz not null, primary key ("id"));`,
    );

    this.addSql(
      `alter table "space" add constraint "space_type_check" check ("type" in ('desk', 'meeting_room', 'booth'));`,
    );
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "space" cascade;`);
  }
}
