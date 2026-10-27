import { Migration } from '@mikro-orm/migrations';

export class Migration20261028100000 extends Migration {
  override name = 'Migration20261028100000';

  override up(): void {
    this.addSql(
      `alter table "app_user" add column "first_name" varchar(255) not null default '';`,
    );
    this.addSql(
      `alter table "app_user" add column "last_name" varchar(255) not null default '';`,
    );
    this.addSql(
      `alter table "app_user" add column "phone" varchar(255) not null default '';`,
    );
  }

  override down(): void {
    this.addSql(`alter table "app_user" drop column "phone";`);
    this.addSql(`alter table "app_user" drop column "last_name";`);
    this.addSql(`alter table "app_user" drop column "first_name";`);
  }
}
