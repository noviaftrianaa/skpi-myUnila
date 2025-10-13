# ========================================
# Auth Service Dockerfile - Alpine Version
# ========================================
FROM php:8.2-fpm-alpine

# Set working directory
WORKDIR /var/www

# Install system dependencies (Alpine packages)
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    oniguruma-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    bash \
    && apk add --no-cache --virtual .build-deps \
    $PHPIZE_DEPS \
    autoconf \
    g++ \
    make

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Install Redis extension
RUN pecl channel-update pecl.php.net \
    && pecl install redis-5.3.7 \
    && docker-php-ext-enable redis

# Install SQL Server ODBC Driver and tools (Alpine)
RUN curl -O https://download.microsoft.com/download/3/5/5/355d7943-a338-41a7-858d-53b259ea33f5/msodbcsql18_18.3.2.1-1_amd64.apk \
    && curl -O https://download.microsoft.com/download/3/5/5/355d7943-a338-41a7-858d-53b259ea33f5/mssql-tools18_18.3.1.1-1_amd64.apk \
    && apk add --allow-untrusted msodbcsql18_18.3.2.1-1_amd64.apk \
    && apk add --allow-untrusted mssql-tools18_18.3.1.1-1_amd64.apk \
    && rm -f msodbcsql18_18.3.2.1-1_amd64.apk mssql-tools18_18.3.1.1-1_amd64.apk

# Install unixODBC development files
RUN apk add --no-cache unixodbc-dev

# Install SQL Server PHP drivers
RUN pecl install sqlsrv-5.12.0 pdo_sqlsrv-5.12.0 \
    && docker-php-ext-enable sqlsrv pdo_sqlsrv

# Clean up build dependencies
RUN apk del .build-deps \
    && rm -rf /tmp/pear

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy application files
COPY . /var/www

# Create necessary directories
RUN mkdir -p /var/www/storage/framework/{sessions,views,cache} \
    && mkdir -p /var/www/storage/logs \
    && mkdir -p /var/www/bootstrap/cache

# Set permissions
RUN chown -R www-data:www-data /var/www \
    && chmod -R 755 /var/www/storage \
    && chmod -R 755 /var/www/bootstrap/cache

# Expose port 9000 for PHP-FPM
EXPOSE 9000

# Start PHP-FPM
CMD ["php-fpm"]
