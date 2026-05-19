IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'album_shop')
BEGIN
	CREATE DATABASE [album_shop];
END;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'album_shop_shadow')
BEGIN
	CREATE DATABASE [album_shop_shadow];
END;
GO
