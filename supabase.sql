-- Activer la sécurité au niveau de la ligne
ALTER DATABASE postgres SET "anon" TO 'anon';

-- Créer des tables pour la gestion des clients, véhicules, types d'interventions et interventions
-- avec des UUID comme identifiants uniques et des politiques de sécurité au niveau des lignes (RLS)
CREATE TABLE IF NOT EXISTS clients (
    ClientID UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    Nom VARCHAR(100) NOT NULL,
    Prenom VARCHAR(100) NOT NULL,
    Email VARCHAR(255),
    Telephone VARCHAR(20),
    DateCreation TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehicules (
    VehiculeID UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ClientID UUID REFERENCES clients(ClientID) ON DELETE CASCADE,
    Marque VARCHAR(50) NOT NULL,
    Modele VARCHAR(50) NOT NULL,
    Annee INTEGER,
    Immatriculation VARCHAR(20) NOT NULL UNIQUE,
    DateCreation TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS types_interventions (
    TypeInterventionID UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    Nom VARCHAR(100) NOT NULL,
    Description TEXT,
    PrixBase DECIMAL(10,2)
);

CREATE TABLE IF NOT EXISTS interventions (
    InterventionID UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    VehiculeID UUID REFERENCES vehicules(VehiculeID) ON DELETE CASCADE,
    TypeInterventionID UUID REFERENCES types_interventions(TypeInterventionID),
    DateIntervention DATE NOT NULL,
    Description TEXT,
    Prix DECIMAL(10,2),
    Statut VARCHAR(20) DEFAULT 'En attente',
    DateCreation TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Activer RLS sur toutes les tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicules ENABLE ROW LEVEL SECURITY;
ALTER TABLE types_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;

-- Créer des politiques
CREATE POLICY "Enable read access for all users" ON clients FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON clients FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON clients FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON vehicules FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON vehicules FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON vehicules FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON vehicules FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON types_interventions FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON types_interventions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON types_interventions FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON types_interventions FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON interventions FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON interventions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON interventions FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON interventions FOR DELETE USING (true);

-- Insérer des types d'intervention par défaut
INSERT INTO types_interventions (Nom, Description, PrixBase) VALUES
('Vidange', 'Changement d''huile et du filtre à huile', 80.00),
('Révision', 'Contrôle général du véhicule', 120.00),
('Freinage', 'Remplacement des plaquettes et/ou disques de frein', 200.00),
('Pneumatiques', 'Changement des pneus', 400.00),
('Climatisation', 'Recharge de climatisation et contrôle du circuit', 100.00); 