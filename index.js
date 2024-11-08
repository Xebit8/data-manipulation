"use strict";


import { database, username, password } from "./2auth.js";
import { Sequelize, Model, DataTypes } from "sequelize";
import { fakerRU, ru } from "@faker-js/faker";

// Connect to PostgreSQL
const sequelize = new Sequelize(database, username, password, {
    host: 'localhost',
    dialect: 'postgres',
    omitNull: true,
});

(async function createORM() {
    try {
        await sequelize.authenticate();
        console.log("Successfully authenticated!");

        // Create models
        const ServiceCenters = sequelize.define(
            'service_center',
            {
                city: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                address: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                postal_code: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                phone_number: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                staff: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    defaultValue: 1,
                },
            },
            {
                timestamps: false,
            },
        );

        const Employees = sequelize.define(
            'employee',
            {
                full_name: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                age: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                position: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                phone_number: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                email: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                    defaultValue: 1,
                },
                experience: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                salary: {
                    type: DataTypes.DECIMAL(10, 2),
                    allowNull: false,
                },
                short_info: DataTypes.TEXT,
                service_center_id: {
                    type: DataTypes.INTEGER,
                    references: {
                        model: ServiceCenters,
                        key: "id",
                        onDelete: "SET NULL",
                    }
                },
            },
            {
                timestamps: false,
            },
        );
        
        const Clients = sequelize.define(
            'client',
            {
                full_name: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                contact_info: DataTypes.TEXT,
                status: {
                    type: DataTypes.TEXT,
                    validate: {
                        isIn: [["Обычный", "Постоянный", "Премиум"]],
                    },
                },
                bonus_points: {
                    type: DataTypes.TEXT,
                    defaultValue: 0,
                },
                last_purchase_date: {
                    type: DataTypes.DATE,
                },
            },
            {
                timestamps: false,
            },
        );
        
        const Services = sequelize.define(
            'service',
            {
                service_name: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                service_center_id: 
                {
                    type: DataTypes.INTEGER,
                    references: {
                        model: ServiceCenters,
                        key: "id",
                        onDelete: "CASCADE",
                    }

                },
                price: {
                    type: DataTypes.DECIMAL(10, 2),
                    allowNull: false,
                },
            },
            {
                timestamps: false,
            },
        );

        const Parts = sequelize.define(
            'part',
            {
                part_name: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                },
                quantity: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                },
                price: {
                    type: DataTypes.DECIMAL(10, 2),
                    allowNull: false,
                },
                service_center_id: 
                {
                    type: DataTypes.TEXT,
                    references: {
                        model: ServiceCenters,
                        key: "id",
                        onDelete: "CASCADE",
                    }
                },
            },
            {
                timestamps: false,
            },
        );
        
        const VehiclesRepairment = sequelize.define(
            'vehicles_repairment',
            {
                vehicle_type: {
                    type: DataTypes.TEXT,
                    allowNull: false,
                    validate: {
                        isIn: [["Автомобиль", "Мотоцикл"]],
                    },
                },
                service_id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: Services,
                        key: "id",
                        onDelete: "CASCADE",
                    }
                },
                part_id: 
                {
                    type: DataTypes.INTEGER,
                    references: {
                        model: Parts,
                        key: "id",
                        onDelete: "CASCADE",
                    }
                },
            },
            {
                tableName: "vehicles_repairment",
                timestamps: false,
            },
        );
        
        const Orders = sequelize.define(
            'order',
            {
                client_id: {
                    type: DataTypes.INTEGER,
                    references: {
                        model: Clients,
                        key: "id",
                        onDelete: "CASCADE",
                    }
                },
                service_id: 
                {
                    type: DataTypes.INTEGER,
                    references: {
                        model: Services,
                        key: "id",
                        onDelete: "CASCADE",
                    }
                },
                order_time: {
                    type: "TIMESTAMP",
                    defaultValue: sequelize.literal("now()::Date"),
                },
                status: {
                    type: DataTypes.TEXT,
                    validate: {
                        isIn: [["Ожидание", "Выполнен", "Отменен"]],
                    },
                },
            },
            {
                timestamps: false,
            },
        );

        const Invoices = sequelize.define(
            'invoice',
            {
                order_id: 
                {
                    type: DataTypes.INTEGER,
                    references: {
                        model: Orders,
                        key: "id",
                        onDelete: "CASCADE",
                    }
                },
                total_sum: {
                    type: DataTypes.DECIMAL(10, 2),
                    allowNull: false,
                },
                invoice_date: {
                    type: "TIMESTAMP",
                    defaultValue: sequelize.literal("now()::Date")
                },
            },
            {
                timestamps: false,
            },
        );

        // Build relationships
        Employees.belongsTo(ServiceCenters, {foreignKey: "service_center_id"});
        Services.belongsTo(ServiceCenters, {foreignKey: "service_center_id"});
        Parts.belongsTo(ServiceCenters, {foreignKey: "service_center_id"});
        VehiclesRepairment.belongsTo(Services, {foreignKey: "service_id"});
        Orders.belongsTo(Services, {foreignKey: "service_id"});
        VehiclesRepairment.belongsTo(Parts, {foreignKey: "part_id"});
        Orders.belongsTo(Clients, {foreignKey: "client_id"});
        Invoices.belongsTo(Orders, {foreignKey: "order_id"});

        // Fill models and tables with Faker's data
        await fillTables(500, ServiceCenters, Employees, Clients, Services, Parts, VehiclesRepairment, Orders, Invoices);
        
      
    } catch (error) {
        console.error(error);
    }
})();

async function fillTables(numberOfEntries, ServiceCenters, Employees, Clients, Services, Parts, VehiclesRepairment, Orders, Invoices) {

    for (let i = 0; i < numberOfEntries; i++)
    {
        await ServiceCenters.create({
            city: fakerRU.location.city(),
            address: `${fakerRU.location.city()}, ${fakerRU.location.streetAddress()}, ${fakerRU.location.buildingNumber()}`,
            postal_code: fakerRU.location.zipCode("######"),
            phone_number: fakerRU.phone.number({style: "international"}),
            staff: fakerRU.number.int({min: 5, max: 50})
        });
    }
    for (let i = 0; i < numberOfEntries; i++)
    {
        await Employees.create({
            full_name: fakerRU.person.fullName(),
            age: fakerRU.number.int({min: 18, max: 60}),
            position: fakerRU.person.jobTitle(),
            phone_number: fakerRU.phone.number({style: "international"}),
            email: fakerRU.internet.email(),
            experience: fakerRU.number.int({min: 5, max: 50}),
            salary: fakerRU.number.int({min: 25000, max: 100000}),
            short_info: fakerRU.lorem.paragraph(),
            service_center_id: fakerRU.number.int({min: 1, max: numberOfEntries})
        });
    }
    for (let i = 0; i < numberOfEntries*5; i++)
    {
        await Clients.create({
            full_name: fakerRU.person.fullName(),
            contact_info: fakerRU.helpers.arrayElement([fakerRU.phone.number({style: "international"}), fakerRU.internet.email()]),
            status: fakerRU.helpers.arrayElement(["Обычный", "Постоянный", "Премиум"]),
            bonus_points: fakerRU.number.int({max: 100000}),
            last_purchase_date: fakerRU.date.recent({days: 1000})
        });
    }
    for (let i = 0; i < numberOfEntries; i++)
    {
        await Services.create({
            service_name: fakerRU.lorem.word(),
            service_center_id: fakerRU.number.int({min: 1, max: numberOfEntries}),
            price: fakerRU.number.int({min: 100, max: 100000})
        });
    }
    for (let i = 0; i < numberOfEntries; i++)
    {
        await Parts.create({
            part_name: fakerRU.lorem.word(),
            quantity: fakerRU.number.int({max: 1000}),
            price: fakerRU.number.int({min: 100, max: 100000}),
            service_center_id: fakerRU.number.int({min: 1, max: numberOfEntries})
        });
    }
    for (let i = 0; i < numberOfEntries*2; i++)
    {
        await VehiclesRepairment.create({
            vehicle_type: fakerRU.helpers.arrayElement(["Автомобиль", "Мотоцикл"]),
            service_id: fakerRU.number.int({min: 1, max: numberOfEntries}),
            part_id: fakerRU.number.int({min: 1, max: numberOfEntries})
        });
    }
    for (let i = 0; i < numberOfEntries*5; i++)
    {
        await Orders.create({
            client_id: fakerRU.number.int({min: 1, max: numberOfEntries}),
            service_id: fakerRU.number.int({min: 1, max: numberOfEntries}),
            order_time: fakerRU.date.recent({days: 1000}),
            status: fakerRU.helpers.arrayElement(["Ожидание", "Выполнен", "Отменен"])
        });
    }
    for (let i = 0; i < numberOfEntries*5; i++)
    {
        await Invoices.create({
            order_id: fakerRU.number.int({min: 1, max: numberOfEntries}),
            total_sum: fakerRU.finance.amount({min: 100, dec: 2}),
            invoice_date: fakerRU.date.recent({days: 1000})
        });
    }
}