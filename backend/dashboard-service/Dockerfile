# ========================================
# Dashboard Service Dockerfile - Alpine (Fixed)
# Optimized for smaller image size
# ========================================
FROM php:8.2-fpm-alpine

WORKDIR /var/www

# Install ALL dependencies first (including build tools and ODBC)
RUN apk add --no-cache \
    git \
    curl \
    bash \
    libpng-dev \
    oniguruma-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    # SQL Server ODBC dependencies - MUST be installed first
    unixodbc \
    unixodbc-dev \
    # Build tools - keep for extension compilation
    $PHPIZE_DEPS \
    autoconf \
    g++ \
    make

# Install basic PHP extensions (no SQL Server yet)
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Install Microsoft SQL Server ODBC Driver 18 for Alpine
RUN curl -O https://download.microsoft.com/download/3/5/5/355d7943-a338-41a7-858d-53b259ea33f5/msodbcsql18_18.3.2.1-1_amd64.apk \
    && curl -O https://download.microsoft.com/download/3/5/5/355d7943-a338-41a7-858d-53b259ea33f5/mssql-tools18_18.3.1.1-1_amd64.apk \
    && apk add --allow-untrusted msodbcsql18_18.3.2.1-1_amd64.apk \
    && apk add --allow-untrusted mssql-tools18_18.3.1.1-1_amd64.apk \
    && rm -f *.apk

# Install Redis extension via PECL (more reliable than manual compile)
RUN pecl channel-update pecl.php.net \
    && pecl install redis-5.3.7 \
    && docker-php-ext-enable redis

# Install SQL Server PHP drivers via PECL
# IMPORTANT: unixODBC must be installed BEFORE this step
RUN pecl install sqlsrv-5.12.0 pdo_sqlsrv-5.12.0 \
    && docker-php-ext-enable sqlsrv pdo_sqlsrv

# Clean up (but keep runtime dependencies)
RUN apk del $PHPIZE_DEPS autoconf g++ make \
    && rm -rf /tmp/pear /tmp/* /var/cache/apk/*

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configure Composer for better network reliability
RUN composer config -g process-timeout 600 \
    && composer config -g repos.packagist composer https://packagist.org

# Copy application
COPY . /var/www

# Install dependencies with increased timeout and retry
RUN COMPOSER_PROCESS_TIMEOUT=600 composer install \
    --no-dev \
    --optimize-autoloader \
    --no-interaction \
    --prefer-dist \
    --no-scripts \
    || (sleep 5 && COMPOSER_PROCESS_TIMEOUT=600 composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist --no-scripts) \
    && composer run-script post-autoload-dump --no-interaction || true

# Create directories
RUN mkdir -p /var/www/storage/framework/{sessions,views,cache} \
    && mkdir -p /var/www/storage/logs \
    && mkdir -p /var/www/bootstrap/cache

# Set permissions
RUN chown -R www-data:www-data /var/www \
    && chmod -R 755 /var/www/storage \
    && chmod -R 755 /var/www/bootstrap/cache

# PHP configuration - Optimized for 8 CPU / 16GB RAM
RUN { \
    echo 'memory_limit = 1024M'; \
    echo 'max_execution_time = 300'; \
    echo 'max_input_time = 300'; \
    echo 'post_max_size = 100M'; \
    echo 'upload_max_filesize = 100M'; \
    echo 'default_socket_timeout = 180'; \
    echo 'opcache.enable = 1'; \
    echo 'opcache.memory_consumption = 512'; \
    echo 'opcache.interned_strings_buffer = 32'; \
    echo 'opcache.max_accelerated_files = 20000'; \
    echo 'opcache.revalidate_freq = 2'; \
    echo 'opcache.fast_shutdown = 1'; \
    echo 'opcache.validate_timestamps = 0'; \
    echo 'realpath_cache_size = 8192K'; \
    echo 'realpath_cache_ttl = 7200'; \
} > /usr/local/etc/php/conf.d/custom.ini

# PHP-FPM configuration - Optimized for 8 CPU / 16GB RAM
# With 16GB RAM and assuming ~80MB per PHP process, we can handle ~150 processes
# Reserving ~4GB for other services, we allocate ~12GB for PHP-FPM
RUN echo "pm = dynamic" >> /usr/local/etc/php-fpm.d/www.conf \
    && echo "pm.max_children = 150" >> /usr/local/etc/php-fpm.d/www.conf \
    && echo "pm.start_servers = 30" >> /usr/local/etc/php-fpm.d/www.conf \
    && echo "pm.min_spare_servers = 20" >> /usr/local/etc/php-fpm.d/www.conf \
    && echo "pm.max_spare_servers = 50" >> /usr/local/etc/php-fpm.d/www.conf \
    && echo "pm.max_requests = 1000" >> /usr/local/etc/php-fpm.d/www.conf \
    && echo "pm.process_idle_timeout = 30s" >> /usr/local/etc/php-fpm.d/www.conf \
    && echo "request_terminate_timeout = 300" >> /usr/local/etc/php-fpm.d/www.conf

EXPOSE 9000

CMD ["php-fpm"]
