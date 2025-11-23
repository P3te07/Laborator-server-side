--CREATE DATABASE EchipamenteDB;

USE EchipamenteDB;
GO

IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'ag_app_user')
BEGIN
    CREATE USER ag_app_user FOR LOGIN ag_app_user;
END
GO

ALTER ROLE db_owner ADD MEMBER ag_app_user;
GO

