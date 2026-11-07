import {sqliteTable,text,integer} from 'drizzle-orm/sqlite-core';
export const interests=sqliteTable('interests',{id:text('id').primaryKey(),userId:text('user_id').notNull().unique(),accountEmail:text('account_email').notNull(),name:text('name').notNull(),city:text('city').notNull(),state:text('state').notNull(),county:text('county').notNull(),zip:text('zip').notNull(),contactEmail:text('contact_email').notNull(),telephone:text('telephone'),message:text('message'),getInvolved:integer('get_involved').notNull(),consentVersion:text('consent_version').notNull(),created:text('created').notNull(),updated:text('updated').notNull()});

export const opsState=sqliteTable('ops_state',{key:text('key').primaryKey(),value:text('value').notNull()});
export const auditActions=sqliteTable('audit_actions',{id:text('id').primaryKey(),actor:text('actor').notNull(),action:text('action').notNull(),target:text('target').notNull(),note:text('note').notNull(),created:text('created').notNull()});
