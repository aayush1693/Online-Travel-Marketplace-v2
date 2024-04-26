-- Create a database (if it doesn't exist)
CREATE DATABASE IF NOT EXISTS travel_marketplace;
USE travel_marketplace;

-- Create a 'users' table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) ,
    email VARCHAR(255)  UNIQUE,
    password_hash VARCHAR(255) ,
    password_reset_token VARCHAR(255),
    password_reset_expires BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create a 'businesses' table
CREATE TABLE IF NOT EXISTS businesses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_name VARCHAR(255) ,
    email VARCHAR(255)  UNIQUE,
    password_hash VARCHAR(255) ,
    password_reset_token VARCHAR(255),
    password_reset_expires BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create a 'services' table
CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_name VARCHAR(255) ,
    name VARCHAR(255) ,
    description TEXT ,
    price DECIMAL(10, 2) ,
    date DATE ,
    time TIME ,
    image VARCHAR(255) ,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

-- Create a 'reviews' table
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255),
    package_id VARCHAR(255),
    rating INT ,
    review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

-- Create a 'bookings' table
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) ,
    email VARCHAR(255) ,
    business_name VARCHAR(255) ,
    package_id VARCHAR(255) ,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);