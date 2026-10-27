import { Migration } from '@mikro-orm/migrations';

export class Migration20261028110000 extends Migration {
  override name = 'Migration20261028110000';

  override up(): void {
    this.addSql(
      `create table "reservation" ("id" uuid not null, "user_id" uuid not null, "space_id" uuid not null, "starts_at" timestamptz not null, "ends_at" timestamptz not null, "duration_hours" int not null, "total_price" int not null, "status" text not null default 'confirmed', "created_at" timestamptz not null, constraint "reservation_pkey" primary key ("id"));`,
    );
    this.addSql(
      `alter table "reservation" add constraint "reservation_status_check" check ("status" in ('confirmed', 'cancelled'));`,
    );
    this.addSql(
      `create index "reservation_user_id_index" on "reservation" ("user_id");`,
    );
    this.addSql(
      `create index "reservation_space_id_index" on "reservation" ("space_id");`,
    );
    this.addSql(
      `create index "reservation_user_schedule_index" on "reservation" ("user_id", "starts_at", "ends_at", "status");`,
    );
    this.addSql(
      `create index "reservation_space_schedule_index" on "reservation" ("space_id", "starts_at", "ends_at", "status");`,
    );
    this.addSql(
      `alter table "reservation" add constraint "reservation_user_id_foreign" foreign key ("user_id") references "app_user" ("id") on update cascade;`,
    );
    this.addSql(
      `alter table "reservation" add constraint "reservation_space_id_foreign" foreign key ("space_id") references "space" ("id") on update cascade;`,
    );
  }

  override down(): void {
    this.addSql(`drop table if exists "reservation" cascade;`);
  }
}
