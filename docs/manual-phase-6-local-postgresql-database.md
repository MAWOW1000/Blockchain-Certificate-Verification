# Manual Phase 6: Create the Local PostgreSQL Database

This guide explains how to create a local PostgreSQL database for the Blockchain-Based Academic Certificate Verification project.

Phase 6 goal:

```text
Create a local PostgreSQL database that the backend can later use through Prisma.
```

In this phase, you will:

1. Check that PostgreSQL is installed.
2. Start the PostgreSQL service.
3. Create a local database.
4. Create or choose a database user.
5. Build the `DATABASE_URL`.
6. Test that the database connection works.
7. Save the database URL for the backend phase.

Database tables and Prisma models will be created in a later phase.

## 1. Why We Need PostgreSQL

The blockchain should only store certificate proof.

For this project, PostgreSQL will store normal application data such as:

```text
users
issuer profiles
student information
certificate metadata
certificate PDF paths
QR code data
verification history
```

Important rule:

```text
Do not store full student personal data on-chain.
Store private application data in PostgreSQL.
Store only certificate ID, hash, issuer, timestamp, and revoke status on-chain.
```

## 2. Make Sure Previous Phases Are Complete

Before Phase 6, you should have:

```text
contracts/CertificateRegistry.sol
test/CertificateRegistry.ts
ignition/modules/CertificateRegistry.ts
local deployed contract address
```

Your local deployed contract address should look similar to:

```text
0x5FbDB2315678afecb367f032d93F642f64180aa3
```

This address will be used later by the backend.

## 3. Check PostgreSQL Installation

Run:

```bash
psql --version
```

Expected result:

```text
psql (PostgreSQL) 14.x
```

or another PostgreSQL version.

If you see:

```text
psql: command not found
```

PostgreSQL is not installed yet.

## 4. Install PostgreSQL on Ubuntu

Run:

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

Meaning:

```text
postgresql
```

Installs the PostgreSQL database server.

```text
postgresql-contrib
```

Installs useful extra PostgreSQL tools and extensions.

## 5. Start PostgreSQL

Run:

```bash
sudo service postgresql start
```

Check status:

```bash
sudo service postgresql status
```

You should see PostgreSQL running.

If your system uses `systemctl`, you can use:

```bash
sudo systemctl start postgresql
sudo systemctl status postgresql
```

## 6. Open PostgreSQL Shell

Run:

```bash
sudo -u postgres psql
```

Meaning:

```text
sudo -u postgres
```

Runs the command as the default PostgreSQL admin user.

```text
psql
```

Opens the PostgreSQL command shell.

You should see:

```text
postgres=#
```

## 7. Create the Database

Inside `psql`, run:

```sql
CREATE DATABASE certificate_db;
```

Meaning:

```text
certificate_db
```

The local database name for this project.

Check that it exists:

```sql
\l
```

You should see `certificate_db` in the database list.

## 8. Create a Local Database User

Inside `psql`, run:

```sql
CREATE USER certificate_user WITH PASSWORD 'certificate_password';
```

Meaning:

```text
certificate_user
```

The database username the backend will use.

```text
certificate_password
```

The local development password.

For a real deployed project, use a stronger password and keep it secret.

## 9. Give the User Access to the Database

Inside `psql`, run:

```sql
GRANT ALL PRIVILEGES ON DATABASE certificate_db TO certificate_user;
```

Then connect to the new database:

```sql
\c certificate_db
```

Grant schema permissions:

```sql
GRANT ALL ON SCHEMA public TO certificate_user;
```

Meaning:

```text
GRANT ALL PRIVILEGES
```

Allows the backend user to create, read, update, and delete data in this database.

```text
SCHEMA public
```

The default PostgreSQL schema where Prisma will later create tables.

## 10. Exit PostgreSQL Shell

Run:

```sql
\q
```

You are now back in the normal terminal.

## 11. Build the Database URL

The database URL format is:

```env
postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME
```

For this phase:

```env
DATABASE_URL=postgresql://certificate_user:certificate_password@localhost:5432/certificate_db
```

Meaning:

```text
certificate_user
```

PostgreSQL username.

```text
certificate_password
```

PostgreSQL password.

```text
localhost
```

Database runs on your own computer.

```text
5432
```

Default PostgreSQL port.

```text
certificate_db
```

Database name.

## 12. Test the Database Connection

Run:

```bash
psql "postgresql://certificate_user:certificate_password@localhost:5432/certificate_db"
```

If it works, you should see:

```text
certificate_db=>
```

Run:

```sql
SELECT current_database();
```

Expected result:

```text
certificate_db
```

Exit:

```sql
\q
```

## 13. Save the Environment Variable

Later, the backend will use this value in:

```text
backend/.env
```

Example:

```env
PORT=5000
DATABASE_URL=postgresql://certificate_user:certificate_password@localhost:5432/certificate_db
LOCAL_RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
JWT_SECRET=replace_with_a_long_random_secret
```

Important:

```text
Do not commit backend/.env to GitHub.
Commit only .env.example.
```

## 14. Optional: Create the Database Without Opening psql

You can also create the database directly:

```bash
sudo -u postgres createdb certificate_db
```

Then create the user:

```bash
sudo -u postgres createuser certificate_user
```

You still need to open `psql` to set the password and grant permissions:

```bash
sudo -u postgres psql
```

Then:

```sql
ALTER USER certificate_user WITH PASSWORD 'certificate_password';
GRANT ALL PRIVILEGES ON DATABASE certificate_db TO certificate_user;
\c certificate_db
GRANT ALL ON SCHEMA public TO certificate_user;
\q
```

## 15. Common Problem: Database Already Exists

If you see:

```text
ERROR: database "certificate_db" already exists
```

That means the database was already created.

You can keep using it.

Check:

```bash
psql "postgresql://certificate_user:certificate_password@localhost:5432/certificate_db"
```

Only delete the database if you are sure you do not need its data.

## 16. Common Problem: Password Authentication Failed

If you see:

```text
password authentication failed for user "certificate_user"
```

Open PostgreSQL as admin:

```bash
sudo -u postgres psql
```

Reset the password:

```sql
ALTER USER certificate_user WITH PASSWORD 'certificate_password';
\q
```

Try connecting again:

```bash
psql "postgresql://certificate_user:certificate_password@localhost:5432/certificate_db"
```

## 17. Common Problem: Permission Denied for Schema public

If Prisma later says:

```text
permission denied for schema public
```

Open PostgreSQL:

```bash
sudo -u postgres psql
```

Run:

```sql
\c certificate_db
GRANT ALL ON SCHEMA public TO certificate_user;
\q
```

## 18. Common Problem: PostgreSQL Is Not Running

If connection fails with:

```text
connection refused
```

Start PostgreSQL:

```bash
sudo service postgresql start
```

Then test again:

```bash
psql "postgresql://certificate_user:certificate_password@localhost:5432/certificate_db"
```

## 19. What Not To Do in Phase 6

Do not create tables manually yet.

Do not create Prisma models yet.

Do not run Prisma migrations yet.

Those steps belong to a later backend/database phase.

Phase 6 is only about making sure PostgreSQL exists and is reachable.

## 20. Phase 6 Completion Checklist

Phase 6 is complete when:

```text
PostgreSQL is installed
PostgreSQL service is running
certificate_db database exists
certificate_user database user exists
certificate_user can connect to certificate_db
DATABASE_URL is known and saved for backend setup
psql connection test succeeds
```

Next phase:

```text
Phase 7: Create backend
```
