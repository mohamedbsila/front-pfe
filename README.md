# Documentation du Système de Design CSS

Ce document détaille l'architecture CSS et les principes de design utilisés dans le module **Mutuelle** et le tableau de bord de la **Production/Atelier**.

## 🎨 Principes de Design
Le design suit une esthétique **High-End & Professionnelle**, privilégiant le contraste, la clarté et la précision chirurgicale des données.

- **Palette de Couleurs** : 
  - Dominante : Noir (#000, #1a1a1a) et Blanc (#FFF).
  - Échelle de Gris : Utilisée pour la hiérarchie secondaire (#4a4b4c, #8e9196, #f8f9fa).
  - Accents : Utilisés avec parcimonie pour les états (Succès, Avertissement).
- **Typographie** : Utilisation de polices système modernes (Inter, Outfit) et de polices à chasse fixe (Monospace) pour les valeurs numériques afin de garantir un alignement parfait.

## 📊 Composants Core (mutuelle.css)

### 1. Tableaux Formels (`.formal-table`)
Le composant le plus critique, conçu pour afficher des données complexes avec une lisibilité maximale.
- **Bordures Noires Globales** : Toutes les bordures (externes et internes) sont forcées en noir `#000` pour un aspect "grille de précision".
- **Hiérarchie des En-têtes** : Les en-têtes utilisent un fond gris très léger et une bordure inférieure de 2px pour séparer les métadonnées des données de ligne.
- **Lignes de Totaux** : Stylisées avec des fonds distinctifs (ex: Jaune pour les totaux finaux) et une police plus lourde (Font-weight 800+).

### 2. Cartes de Statistiques (`.summary-stat-card`)
Situées en haut et en bas des tableaux, elles fournissent des chiffres clés en un coup d'œil.
- **Effets de Survol** : Ombrage subtil et élévation pour encourager l'interaction.
- **Badges Métriques** : Utilisation de `.metric-badge` pour les valeurs unitaires ou les indicateurs de statut.

### 3. Cartes de Graphiques (`.chart-card`)
Conteneurs pour les graphiques Chart.js.
- **Bordure** : 1px solid #e9ecef (ou #000 selon le contexte).
- **Radius** : 16px pour un aspect moderne et doux malgré le contraste élevé.

## 🛠️ Intégration Dynamique

### Chart.js Theming
Les graphiques intégrés via `workshop.js` suivent strictement la palette monochrome :
- **Trend Charts** : Lignes noires, points avec bordures blanches, remplissage avec opacité 0.05.
- **Doughnut/Circle Charts** : Dégradé de gris et noir. Pas de couleurs "Candy".

### Circular Stats (Progress Circles)
Implémentées avec Chart.js en mode `doughnut`, ces jauges circulaires utilisent :
- **Cutout 85%** : Pour un anneau très fin et élégant.
- **Centre de Texte Absolu** : Affichage de la valeur en gras au centre géographique de l'anneau.

## 📱 Responsive & Layout
- **Grid System** : Utilisation intensive de `display: grid` pour les lignes de cartes de statistiques et les rangées de graphiques.
- **Sidebar & Content Split** : Le dashboard utilise un split professionnel avec une sidebar de navigation à gauche et un contenu défilant à droite.

---
*Note : Toutes les modifications récentes ont renforcé la visibilité des bordures (Black Border Policy) pour une esthétique plus formelle et structurée.*
