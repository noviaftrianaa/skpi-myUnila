install:
	composer install -o --apcu-autoloader

update:
	composer update -o --apcu-autoloader

dump:
	composer dump-autoload -o --apcu

optimize:
	php artisan optimize:clear && php artisan optimize

migrate:
	php artisan migra:schema

seed:
	php artisan db:seed

model:
	php artisan generate:model
