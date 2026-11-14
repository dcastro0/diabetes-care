INSERT INTO achievements (id, code, title, description, icon_name, goal) VALUES
    (gen_random_uuid(), 'FIRST_LOG', 'Primeiro Registro', 'Registre sua primeira medição de glicemia', 'droplet', 1),
    (gen_random_uuid(), 'LOG_STREAK_7', 'Semana de Foco', 'Registre a glicemia por 7 dias seguidos', 'calendar', 7),
    (gen_random_uuid(), 'LOG_STREAK_30', 'Mês de Dedicação', 'Mantenha o acompanhamento diário por 30 dias', 'award', 30),
    (gen_random_uuid(), 'TOTAL_50', '50 Registros', 'Acumule 50 medições de glicemia', 'trending-up', 50),
    (gen_random_uuid(), 'TOTAL_100', 'Centenário', 'Acumule 100 medições de glicemia', 'shield', 100),
    (gen_random_uuid(), 'TIR_80', 'Controle Exemplar', 'Mantenha 80% das leituras na faixa alvo por 7 dias', 'check-circle', 1)
ON CONFLICT (code) DO NOTHING;
