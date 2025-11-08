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

# Install SQL Server PHP drivers with retry mechanism
RUN pecl channel-update pecl.php.net \
    && rm -rf /tmp/pear/cache/* /tmp/pear/download/* \
    && (pecl install sqlsrv-5.12.0 pdo_sqlsrv-5.12.0 || \
        (sleep 5 && pecl install sqlsrv-5.12.0 pdo_sqlsrv-5.12.0) || \
        (sleep 10 && pecl install sqlsrv pdo_sqlsrv)) \
    && docker-php-ext-enable sqlsrv pdo_sqlsrv

# Clean up build dependencies
RUN apk del .build-deps \
    && rm -rf /tmp/pear

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy application files
COPY . /var/www

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist

# Create necessary directories
RUN mkdir -p /var/www/storage/framework/{sessions,views,cache} \
    && mkdir -p /var/www/storage/logs \
    && mkdir -p /var/www/bootstrap/cache

# Set permissions
RUN chown -R www-data:www-data /var/www \
    && chmod -R 755 /var/www/storage \
    && chmod -R 755 /var/www/bootstrap/cache

# Configure PHP settings for production
RUN { \
    echo 'memory_limit = 512M'; \
    echo 'max_execution_time = 180'; \
    echo 'max_input_time = 180'; \
    echo 'post_max_size = 100M'; \
    echo 'upload_max_filesize = 100M'; \
    echo 'default_socket_timeout = 180'; \
    echo 'opcache.enable = 1'; \
    echo 'opcache.memory_consumption = 256'; \
    echo 'opcache.interned_strings_buffer = 16'; \
    echo 'opcache.max_accelerated_files = 10000'; \
    echo 'opcache.revalidate_freq = 2'; \
    echo 'opcache.fast_shutdown = 1'; \
    echo 'realpath_cache_size = 4096K'; \
    echo 'realpath_cache_ttl = 600'; \
} > /usr/local/etc/php/conf.d/custom.ini

# Configure PHP-FPM pool to handle slow SQL queries
RUN echo "pm = dynamic" >> /usr/local/etc/php-fpm.d/www.conf \
    && echo "pm.max_children = 50" >> /usr/local/etc/php-fpm.d/www.conf \
    && echo "pm.start_servers = 10" >> /usr/local/etc/php-fpm.d/www.conf \
    && echo "pm.min_spare_servers = 5" >> /usr/local/etc/php-fpm.d/www.conf \
    && echo "pm.max_spare_servers = 20" >> /usr/local/etc/php-fpm.d/www.conf \
    && echo "pm.max_requests = 500" >> /usr/local/etc/php-fpm.d/www.conf \
    && echo "request_terminate_timeout = 180" >> /usr/local/etc/php-fpm.d/www.conf

# Expose port 9000 for PHP-FPM
EXPOSE 9000

# Start PHP-FPM
CMD ["php-fpm"]
