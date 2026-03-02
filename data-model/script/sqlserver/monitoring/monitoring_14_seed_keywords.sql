-- ============================================================
-- monitoring_14_seed_keywords.sql
-- Seed data: default keyword judol untuk deteksi konten negatif
-- ============================================================

declare @system_user uniqueidentifier = '00000000-0000-0000-0000-000000000000'
declare @now datetime = getdate()

-- Hapus data lama jika ada (idempoten)
delete from monitoring.threat_keywords where id_creator = @system_user
go

declare @system_user uniqueidentifier = '00000000-0000-0000-0000-000000000000'
declare @now datetime = getdate()

insert into monitoring.threat_keywords
    (keyword, category, weight, is_regex, is_active, create_date, id_creator, last_update, id_updater, soft_delete)
values
-- ============================================================
-- Category: slot
-- ============================================================
('slot gacor',          'slot', 9, 0, 1, @now, @system_user, @now, null, 0),
('slot online',         'slot', 8, 0, 1, @now, @system_user, @now, null, 0),
('slot deposit',        'slot', 8, 0, 1, @now, @system_user, @now, null, 0),
('rtp slot',            'slot', 8, 0, 1, @now, @system_user, @now, null, 0),
('slot terpercaya',     'slot', 7, 0, 1, @now, @system_user, @now, null, 0),
('pragmatic play',      'slot', 7, 0, 1, @now, @system_user, @now, null, 0),
('scatter hitam',       'slot', 8, 0, 1, @now, @system_user, @now, null, 0),
('daftar slot',         'slot', 7, 0, 1, @now, @system_user, @now, null, 0),
('maxwin',              'slot', 7, 0, 1, @now, @system_user, @now, null, 0),
('gacor hari ini',      'slot', 8, 0, 1, @now, @system_user, @now, null, 0),
('slot dana',           'slot', 8, 0, 1, @now, @system_user, @now, null, 0),
('slot pulsa',          'slot', 8, 0, 1, @now, @system_user, @now, null, 0),
('bocoran slot',        'slot', 7, 0, 1, @now, @system_user, @now, null, 0),
('pola slot',           'slot', 6, 0, 1, @now, @system_user, @now, null, 0),
-- Regex: slot + modifiers
('slot\s*(gacor|online|terpercaya|deposit|dana|pulsa|777|88)', 'slot', 8, 1, 1, @now, @system_user, @now, null, 0),

-- ============================================================
-- Category: togel
-- ============================================================
('togel online',        'togel', 9, 0, 1, @now, @system_user, @now, null, 0),
('bandar togel',        'togel', 9, 0, 1, @now, @system_user, @now, null, 0),
('togel sgp',           'togel', 8, 0, 1, @now, @system_user, @now, null, 0),
('togel hk',            'togel', 8, 0, 1, @now, @system_user, @now, null, 0),
('togel sidney',        'togel', 7, 0, 1, @now, @system_user, @now, null, 0),
('togel macau',         'togel', 8, 0, 1, @now, @system_user, @now, null, 0),
('prediksi togel',      'togel', 7, 0, 1, @now, @system_user, @now, null, 0),
('keluaran togel',      'togel', 7, 0, 1, @now, @system_user, @now, null, 0),
-- Regex: togel + modifiers
('togel\s*(sgp|hk|sidney|macau|online|hari\s*ini)', 'togel', 8, 1, 1, @now, @system_user, @now, null, 0),

-- ============================================================
-- Category: casino
-- ============================================================
('judi online',         'casino', 9, 0, 1, @now, @system_user, @now, null, 0),
('casino online',       'casino', 8, 0, 1, @now, @system_user, @now, null, 0),
('live casino',         'casino', 8, 0, 1, @now, @system_user, @now, null, 0),
('baccarat online',     'casino', 7, 0, 1, @now, @system_user, @now, null, 0),
('roulette online',     'casino', 7, 0, 1, @now, @system_user, @now, null, 0),

-- ============================================================
-- Category: poker
-- ============================================================
('poker online',        'poker', 7, 0, 1, @now, @system_user, @now, null, 0),
('judi bola',           'poker', 7, 0, 1, @now, @system_user, @now, null, 0),
('situs judi',          'poker', 8, 0, 1, @now, @system_user, @now, null, 0),
('taruhan online',      'poker', 7, 0, 1, @now, @system_user, @now, null, 0),
('agen bola',           'poker', 7, 0, 1, @now, @system_user, @now, null, 0),

-- ============================================================
-- Category: generic (indikator konten judi)
-- ============================================================
('bonus new member',    'generic', 6, 0, 1, @now, @system_user, @now, null, 0),
('link alternatif',     'generic', 6, 0, 1, @now, @system_user, @now, null, 0),
('bo terpercaya',       'generic', 7, 0, 1, @now, @system_user, @now, null, 0),
('jackpot',             'generic', 5, 0, 1, @now, @system_user, @now, null, 0),
('daftar sekarang',     'generic', 3, 0, 1, @now, @system_user, @now, null, 0),
('deposit minimal',     'generic', 5, 0, 1, @now, @system_user, @now, null, 0),
('withdraw',            'generic', 4, 0, 1, @now, @system_user, @now, null, 0),
('wd gampang',          'generic', 6, 0, 1, @now, @system_user, @now, null, 0),
('anti rungkad',        'generic', 6, 0, 1, @now, @system_user, @now, null, 0),
('server thailand',     'generic', 7, 0, 1, @now, @system_user, @now, null, 0)
go

-- Verifikasi
select category, count(*) as total
from monitoring.threat_keywords
where id_creator = '00000000-0000-0000-0000-000000000000'
group by category
order by category
go

print 'Seed data threat_keywords inserted.'
go
