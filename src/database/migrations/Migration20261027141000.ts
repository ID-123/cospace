import { Migration } from "@mikro-orm/migrations";

export class Migration20261027141000 extends Migration {
  override name = "Migration20261027141000";

  override up(): void {
    this.addSql(
      `create table "app_user" ("id" uuid not null, "email" varchar(255) not null, "password_hash" varchar(255) not null, "role" text not null default 'user', "is_active" boolean not null default true, "created_at" timestamptz not null, constraint "app_user_pkey" primary key ("id"));`,
    );
    this.addSql(
      `alter table "app_user" add constraint "app_user_email_unique" unique ("email");`,
    );
    this.addSql(
      `alter table "app_user" add constraint "app_user_role_check" check ("role" in ('user', 'admin'));`,
    );

    this.addSql(
      `create table "refresh_token" ("id" uuid not null, "token_hash" varchar(255) not null, "user_id" uuid not null, "expires_at" timestamptz not null, "revoked_at" timestamptz null, "created_at" timestamptz not null, constraint "refresh_token_pkey" primary key ("id"));`,
    );
    this.addSql(
      `alter table "refresh_token" add constraint "refresh_token_token_hash_unique" unique ("token_hash");`,
    );
    this.addSql(
      `create index "refresh_token_user_id_index" on "refresh_token" ("user_id");`,
    );
    this.addSql(
      `alter table "refresh_token" add constraint "refresh_token_user_id_foreign" foreign key ("user_id") references "app_user" ("id");`,
    );
  }

  override down(): void {
    this.addSql(`drop table if exists "refresh_token" cascade;`);
    this.addSql(`drop table if exists "app_user" cascade;`);
  }
}
