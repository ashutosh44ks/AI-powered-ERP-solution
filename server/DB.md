# Database Schema for AI Dashboard POC
This document outlines the PostgreSQL schema for the Proof of Concept (POC) AI-powered dashboard. The schema consists of two main tables: users and widgets.

## users Table
The users table is the central point for user authentication and management.

### Purpose: To store user login information and act as the primary key for associating widgets.

### Columns:

user_id: A unique, auto-incrementing integer serving as the primary key.
name: The user's full name.
email: The user's email address.
created_at: A timestamp with time zone, automatically set upon creation.

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

## widgets Table
The widgets table stores the individual components of each user's dashboard.

### Purpose: To store the user's prompt, the generated content from the AI model, and to link each widget back to a specific user.

### Columns:

id: A unique, auto-incrementing integer serving as the primary key.
user_id: A foreign key that references the id column in the users table. This is the crucial link that ties a widget to a user.
prompt: A text field to store the user's input prompt.
content: A text field to store the AI-generated output, which will be rendered as UI.
created_at: A timestamp with time zone, automatically set upon creation.
is_deleted: A boolean flag to indicate if the widget has been deleted.

### Constraints:

CONSTRAINT fk_user: A foreign key constraint that ensures every widget belongs to a valid user. ON DELETE CASCADE means that if a user is deleted, all their associated widgets will also be automatically removed.

CREATE TABLE widgets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    prompt TEXT NOT NULL,
    sql_query TEXT,
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
            REFERENCES users(id)
            ON DELETE CASCADE,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

## Script to Setup "Actual" Database

### Terminology
meta_database = users + widgets
actual_database = database - meta_database

### SQL Script to initialise Database
```
-- Drop tables in a safe order to avoid foreign key constraints
-- This is useful for development when you need to re-run the script
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS room_amenities CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS guests CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS amenities CASCADE;

--
-- Table structure for `customers`
--
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

--
-- Table structure for `rooms`
--
CREATE TABLE rooms (
    room_id SERIAL PRIMARY KEY,
    room_number VARCHAR(10) UNIQUE NOT NULL,
    room_type VARCHAR(50) NOT NULL, -- e.g., 'Single', 'Double', 'Suite'
    price_per_night NUMERIC(10, 2) NOT NULL,
    max_occupancy INT NOT NULL,
    is_available BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

--
-- Table structure for `bookings`
--
CREATE TABLE bookings (
    booking_id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    room_id INT NOT NULL REFERENCES rooms(room_id) ON DELETE RESTRICT,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL, -- e.g., 'Pending', 'Confirmed', 'Cancelled'
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT check_check_in_out_dates CHECK (check_out_date > check_in_date)
);

--
-- Table structure for `payments`
--
CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    booking_id INT NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(255) UNIQUE NOT NULL,
    payment_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

--
-- Table structure for `guests`
--
CREATE TABLE guests (
    guest_id SERIAL PRIMARY KEY,
    booking_id INT NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

--
-- Table structure for `amenities`
--
CREATE TABLE amenities (
    amenity_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

--
-- Junction table for `rooms` and `amenities` (Many-to-Many relationship)
--
CREATE TABLE room_amenities (
    room_id INT NOT NULL REFERENCES rooms(room_id) ON DELETE CASCADE,
    amenity_id INT NOT NULL REFERENCES amenities(amenity_id) ON DELETE CASCADE,
    PRIMARY KEY (room_id, amenity_id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

--
-- Triggers for automatic `updated_at` column management
-- This is a best practice to keep track of row changes
--
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON guests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_amenities_updated_at BEFORE UPDATE ON amenities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_room_amenities_updated_at BEFORE UPDATE ON room_amenities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### SQL Script to hydrate Database with dummy data
```
--
-- This script populates the hotel database schema with dummy data.
-- It is designed to be run on a clean database or multiple times on the same
-- database, as it uses TRUNCATE to clear existing data.
--

-- Set the time zone for consistent timestamp handling
SET TIME ZONE 'UTC';

--
-- Step 1: Clear existing data and reset serial counters
--
-- Note: TRUNCATE with CASCADE is a powerful command that will remove all data
-- from the specified tables and also from any tables that reference them via
-- foreign keys. RESTART IDENTITY resets the SERIAL sequences.
TRUNCATE TABLE payments, guests, bookings, room_amenities, amenities, rooms, customers RESTART IDENTITY CASCADE;

--
-- Step 2: Insert data into independent tables
--

-- Insert some customers
INSERT INTO customers (name, email) VALUES
('Jane Doe', 'jane.doe@example.com'),
('John Smith', 'john.smith@example.com'),
('Emily White', 'emily.white@example.com'),
('Michael Brown', 'michael.brown@example.com'),
('Sarah Davis', 'sarah.davis@example.com');

-- Insert some rooms
INSERT INTO rooms (room_number, room_type, price_per_night, max_occupancy, is_available) VALUES
('101', 'Single', 120.00, 1, TRUE),
('102', 'Double', 180.00, 2, TRUE),
('103', 'Suite', 350.00, 4, TRUE),
('201', 'Double', 190.00, 2, TRUE),
('202', 'Single', 130.00, 1, FALSE), -- Unavailable room
('301', 'Suite', 400.00, 5, TRUE);

-- Insert some amenities
INSERT INTO amenities (name, description) VALUES
('Free Wi-Fi', 'High-speed wireless internet access available throughout the hotel.'),
('Minibar', 'A private minibar stocked with beverages and snacks.'),
('Ocean View', 'A stunning view of the ocean from the room window or balcony.'),
('King-size Bed', 'A spacious king-size bed for ultimate comfort.'),
('Jacuzzi', 'A private in-room jacuzzi or hot tub.'),
('Complimentary Breakfast', 'A free continental or hot breakfast for guests.');

--
-- Step 3: Insert data into junction and dependent tables
--

-- Insert room_amenities to link rooms and amenities
INSERT INTO room_amenities (room_id, amenity_id) VALUES
((SELECT room_id FROM rooms WHERE room_number = '101'), (SELECT amenity_id FROM amenities WHERE name = 'Free Wi-Fi')),
((SELECT room_id FROM rooms WHERE room_number = '102'), (SELECT amenity_id FROM amenities WHERE name = 'Free Wi-Fi')),
((SELECT room_id FROM rooms WHERE room_number = '102'), (SELECT amenity_id FROM amenities WHERE name = 'Minibar')),
((SELECT room_id FROM rooms WHERE room_number = '103'), (SELECT amenity_id FROM amenities WHERE name = 'King-size Bed')),
((SELECT room_id FROM rooms WHERE room_number = '103'), (SELECT amenity_id FROM amenities WHERE name = 'Ocean View')),
((SELECT room_id FROM rooms WHERE room_number = '103'), (SELECT amenity_id FROM amenities WHERE name = 'Jacuzzi')),
((SELECT room_id FROM rooms WHERE room_number = '301'), (SELECT amenity_id FROM amenities WHERE name = 'King-size Bed')),
((SELECT room_id FROM rooms WHERE room_number = '301'), (SELECT amenity_id FROM amenities WHERE name = 'Ocean View')),
((SELECT room_id FROM rooms WHERE room_number = '301'), (SELECT amenity_id FROM amenities WHERE name = 'Complimentary Breakfast'));

--
-- Step 4: Insert bookings, which depend on customers and rooms
--

-- Booking for Jane Doe in room 102
INSERT INTO bookings (customer_id, room_id, check_in_date, check_out_date, total_price, status) VALUES
((SELECT customer_id FROM customers WHERE email = 'jane.doe@example.com'),
 (SELECT room_id FROM rooms WHERE room_number = '102'),
 '2025-09-10', '2025-09-14', 720.00, 'Confirmed'); -- 4 nights * $180

-- Booking for John Smith in room 103
INSERT INTO bookings (customer_id, room_id, check_in_date, check_out_date, total_price, status) VALUES
((SELECT customer_id FROM customers WHERE email = 'john.smith@example.com'),
 (SELECT room_id FROM rooms WHERE room_number = '103'),
 '2025-09-15', '2025-09-18', 1050.00, 'Confirmed'); -- 3 nights * $350

-- Booking for Emily White in room 201
INSERT INTO bookings (customer_id, room_id, check_in_date, check_out_date, total_price, status) VALUES
((SELECT customer_id FROM customers WHERE email = 'emily.white@example.com'),
 (SELECT room_id FROM rooms WHERE room_number = '201'),
 '2025-09-20', '2025-09-22', 380.00, 'Confirmed'); -- 2 nights * $190

--
-- Step 5: Insert payments and guests, which depend on bookings
--

-- Payment for Jane Doe's booking
INSERT INTO payments (booking_id, amount, payment_method, transaction_id) VALUES
((SELECT booking_id FROM bookings WHERE customer_id = (SELECT customer_id FROM customers WHERE email = 'jane.doe@example.com') AND room_id = (SELECT room_id FROM rooms WHERE room_number = '102')),
 720.00, 'Credit Card', 'TXN-A1B2C3D4E5');

-- Payment for John Smith's booking
INSERT INTO payments (booking_id, amount, payment_method, transaction_id) VALUES
((SELECT booking_id FROM bookings WHERE customer_id = (SELECT customer_id FROM customers WHERE email = 'john.smith@example.com') AND room_id = (SELECT room_id FROM rooms WHERE room_number = '103')),
 1050.00, 'Debit Card', 'TXN-F6G7H8I9J0');

-- Guests for Jane Doe's booking (2 guests)
INSERT INTO guests (booking_id, first_name, last_name) VALUES
((SELECT booking_id FROM bookings WHERE customer_id = (SELECT customer_id FROM customers WHERE email = 'jane.doe@example.com') AND room_id = (SELECT room_id FROM rooms WHERE room_number = '102')),
 'Jane', 'Doe'),
((SELECT booking_id FROM bookings WHERE customer_id = (SELECT customer_id FROM customers WHERE email = 'jane.doe@example.com') AND room_id = (SELECT room_id FROM rooms WHERE room_number = '102')),
 'Peter', 'Doe');

-- Guests for John Smith's booking (3 guests)
INSERT INTO guests (booking_id, first_name, last_name) VALUES
((SELECT booking_id FROM bookings WHERE customer_id = (SELECT customer_id FROM customers WHERE email = 'john.smith@example.com') AND room_id = (SELECT room_id FROM rooms WHERE room_number = '103')),
 'John', 'Smith'),
((SELECT booking_id FROM bookings WHERE customer_id = (SELECT customer_id FROM customers WHERE email = 'john.smith@example.com') AND room_id = (SELECT room_id FROM rooms WHERE room_number = '103')),
 'Sarah', 'Smith'),
((SELECT booking_id FROM bookings WHERE customer_id = (SELECT customer_id FROM customers WHERE email = 'john.smith@example.com') AND room_id = (SELECT room_id FROM rooms WHERE room_number = '103')),
 'Liam', 'Smith');
```