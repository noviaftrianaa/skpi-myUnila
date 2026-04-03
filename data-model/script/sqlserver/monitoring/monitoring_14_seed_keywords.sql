-- ============================================================
-- monitoring_14_seed_keywords.sql
-- Seed data: default keyword judol untuk deteksi konten negatif
-- ============================================================

declare @system_user uniqueidentifier = '00000000-0000-0000-0000-000000000001'
declare @now datetime = getdate()

-- Hapus data lama jika ada (idempoten)
delete from monitoring.threat_keywords where id_creator = @system_user
go

declare @system_user uniqueidentifier = '00000000-0000-0000-0000-000000000001'
declare @now datetime = getdate()

insert into monitoring.threat_keywords
    (keyword, category, weight, is_active, notes, create_date, id_creator, last_update, soft_delete)
values
-- ============================================================
-- Category: slot
-- ============================================================
('slot gacor',          'slot', 9, 1, null, @now, @system_user, @now, 0),
('slot online',         'slot', 8, 1, null, @now, @system_user, @now, 0),
('slot deposit',        'slot', 8, 1, null, @now, @system_user, @now, 0),
('rtp slot',            'slot', 8, 1, null, @now, @system_user, @now, 0),
('slot terpercaya',     'slot', 7, 1, null, @now, @system_user, @now, 0),
('pragmatic play',      'slot', 7, 1, null, @now, @system_user, @now, 0),
('scatter hitam',       'slot', 8, 1, null, @now, @system_user, @now, 0),
('daftar slot',         'slot', 7, 1, null, @now, @system_user, @now, 0),
('maxwin',              'slot', 7, 1, null, @now, @system_user, @now, 0),
('gacor hari ini',      'slot', 8, 1, null, @now, @system_user, @now, 0),
('slot dana',           'slot', 8, 1, null, @now, @system_user, @now, 0),
('slot pulsa',          'slot', 8, 1, null, @now, @system_user, @now, 0),
('bocoran slot',        'slot', 7, 1, null, @now, @system_user, @now, 0),
('pola slot',           'slot', 6, 1, null, @now, @system_user, @now, 0),
('slot777',             'slot', 8, 1, null, @now, @system_user, @now, 0),
('slot88',              'slot', 8, 1, null, @now, @system_user, @now, 0),

-- ============================================================
-- Category: togel
-- ============================================================
('togel online',        'togel', 9, 1, null, @now, @system_user, @now, 0),
('bandar togel',        'togel', 9, 1, null, @now, @system_user, @now, 0),
('togel sgp',           'togel', 8, 1, null, @now, @system_user, @now, 0),
('togel hk',            'togel', 8, 1, null, @now, @system_user, @now, 0),
('togel sidney',        'togel', 7, 1, null, @now, @system_user, @now, 0),
('togel macau',         'togel', 8, 1, null, @now, @system_user, @now, 0),
('prediksi togel',      'togel', 7, 1, null, @now, @system_user, @now, 0),
('keluaran togel',      'togel', 7, 1, null, @now, @system_user, @now, 0),

-- ============================================================
-- Category: casino
-- ============================================================
('judi online',         'casino', 9, 1, null, @now, @system_user, @now, 0),
('casino online',       'casino', 8, 1, null, @now, @system_user, @now, 0),
('live casino',         'casino', 8, 1, null, @now, @system_user, @now, 0),
('baccarat online',     'casino', 7, 1, null, @now, @system_user, @now, 0),
('roulette online',     'casino', 7, 1, null, @now, @system_user, @now, 0),

-- ============================================================
-- Category: poker
-- ============================================================
('poker online',        'poker', 7, 1, null, @now, @system_user, @now, 0),
('judi bola',           'poker', 7, 1, null, @now, @system_user, @now, 0),
('situs judi',          'poker', 8, 1, null, @now, @system_user, @now, 0),
('taruhan online',      'poker', 7, 1, null, @now, @system_user, @now, 0),
('agen bola',           'poker', 7, 1, null, @now, @system_user, @now, 0),

-- ============================================================
-- Category: generic (indikator konten judi)
-- ============================================================
('bonus new member',    'generic', 6, 1, null, @now, @system_user, @now, 0),
('link alternatif',     'generic', 6, 1, null, @now, @system_user, @now, 0),
('bo terpercaya',       'generic', 7, 1, null, @now, @system_user, @now, 0),
('jackpot',             'generic', 5, 1, null, @now, @system_user, @now, 0),
('daftar sekarang',     'generic', 3, 1, null, @now, @system_user, @now, 0),
('deposit minimal',     'generic', 5, 1, null, @now, @system_user, @now, 0),
('withdraw',            'generic', 4, 1, null, @now, @system_user, @now, 0),
('wd gampang',          'generic', 6, 1, null, @now, @system_user, @now, 0),
('anti rungkad',        'generic', 6, 1, null, @now, @system_user, @now, 0),
('server thailand',     'generic', 7, 1, null, @now, @system_user, @now, 0)
go

-- Verifikasi
select category, count(*) as total
from monitoring.threat_keywords
where id_creator = '00000000-0000-0000-0000-000000000001'
group by category
order by category
go

print 'Seed data threat_keywords inserted.'
go
