CREATE TABLE service_centers (
	"id" SERIAL PRIMARY KEY,
	city TEXT NOT NULL,
	address TEXT NOT NULL,
	postal_code INT NOT NULL,
	phone_number TEXT NOT NULL,
	staff INT NOT NULL DEFAULT 1
);

CREATE TABLE employees (
    "id" SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
	age INT NOT NULL,
    "position" TEXT NOT NULL,
    phone_number TEXT NOT NULL,
	email TEXT NOT NULL,
    experience INT NOT NULL,
    salary DECIMAL(10, 2) NOT NULL,
    short_info TEXT,
    service_center_id INT,
    FOREIGN KEY (service_center_id) REFERENCES service_centers(id) ON DELETE SET NULL
);

CREATE TABLE clients (
    "id" SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    contact_info TEXT,
    status TEXT CHECK (status IN ('Обычный', 'Постоянный', 'Премиум')),
    bonus_points INT DEFAULT 0,
    last_purchase_date DATE
);

CREATE TABLE services (
    "id" SERIAL PRIMARY KEY,
    service_name TEXT NOT NULL,
    service_center_id INT,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (service_center_id) REFERENCES service_centers(id) ON DELETE CASCADE
);

CREATE TABLE parts (
    "id" SERIAL PRIMARY KEY,
    part_name TEXT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    service_center_id INT,
    FOREIGN KEY (service_center_id) REFERENCES service_centers(id) ON DELETE CASCADE
);

CREATE TABLE vehicles_repairment (
	"id" SERIAL PRIMARY KEY,
	vehicle_type TEXT CHECK (vehicle_type IN ('Автомобиль', 'Мотоцикл')),
	service_id INT NOT NULL,
	part_id INT,
	FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
	FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE CASCADE
);

CREATE TABLE orders (
    "id" SERIAL PRIMARY KEY,
    client_id INT,
    service_id INT,
    order_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT CHECK (status IN ('Ожидание', 'Выполнен', 'Отменен')),
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);
	
CREATE TABLE invoices (
    "id" SERIAL PRIMARY KEY,
    order_id INT,
    total_sum DECIMAL(10, 2) NOT NULL,
    invoice_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);