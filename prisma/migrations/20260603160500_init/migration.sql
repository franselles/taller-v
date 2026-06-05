-- CreateTable
CREATE TABLE `Users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NULL,
    `code` VARCHAR(4) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Vehicles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `model` VARCHAR(300) NULL,
    `plate` VARCHAR(10) NULL,
    `km` INTEGER NULL,
    `itv_date` DATE NULL,
    `next_itv_date` DATE NULL,
    `oil_km` INTEGER NULL,
    `next_oil_km` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Reports` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date_report` DATE NULL,
    `km` INTEGER NULL,
    `fault` TEXT NULL,
    `repair` TEXT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `vehicle_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Reports` ADD CONSTRAINT `Reports_vehicle_id_fkey` FOREIGN KEY (`vehicle_id`) REFERENCES `Vehicles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
