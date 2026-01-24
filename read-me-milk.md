# 🥛 Guide du Module Production Laitière

Ce document explique le fonctionnement du système de gestion de la production laitière, les rôles des utilisateurs (Agriculteur vs Admin/Contrôleur) et la signification des données calculées.

---

## 1. Rôle de l'Agriculteur (Saisie) 🧑‍🌾
L'agriculteur est responsable de l'alimentation des données brutes quotidiennes.

### Ce qu'il saisit (Formulaire "Saisie Lait") :
Chaque jour, pour une **Unité** et une **Daira** (Région) données, il entre :
1.  **Date** : La date du jour (verrouillée pour éviter les erreurs).
2.  **Région & Unité** : Le lieu de production (mémoire automatique).
3.  **Vaches Présentes (Hadira)** : Nombre total de vaches dans le troupeau ce jour-là.
4.  **Vaches Traites (Halia)** : Nombre de vaches qui ont effectivement donné du lait.
5.  **Production (L)** : Quantité totale de lait produit (en Litres).
6.  **Vente (L)** : Quantité de lait vendue aux usines/tiers.
7.  **Lait Perdu (L)** : Quantité gaspillée ou perdue.
8.  **Consommation Veaux (L)** : Lait consommé par les veaux.
9.  **Consommation Agneaux (L)** : Lait consommé par les agneaux.
10. **Acheteur** : Nom de l'acheteur (ex: "Sté fromagère italienne").
11. **Prix Unitaire (DT)** : Le prix de vente au litre (ex: 4.400).

### Validations Automatiques :
- ⚠️ **Limite Biologique** : Le système alerte si la production dépasse 40L par vache/jour.
- ⚠️ **Cohérence** : Les vaches traites ne peuvent pas dépasser les vaches présentes.

---

## 2. Rôle de l'Admin / Contrôleur (Analyse) 📊
L'administrateur consulte les rapports agrégés pour surveiller la performance, la rentabilité et les tendances.

### Ce qu'il voit (Tableau "Rapports Lait") :
Le système prend les milliers d'entrées quotidiennes et les groupe par **Année** → **Région/Unité** → **Mois**.

---

## 3. Explication des Tableaux et Valeurs 🧮

### A. Tableau Annuel (Vue Globale)

| Colonne (FR) | Signification & Formule de Calcul |
| :--- | :--- |
| **Revenu Vente (DT)** | `Quantité Vendue × Prix Unitaire`. C'est l'argent gagné par les ventes. |
| **Qté Vendue (L)** | Total des litres vendus sur l'année. |
| **Rendement Halia** | `Production Totale ÷ Moyenne Vaches Traites`. Performance par vache *productive*. |
| **Rendement Hadira** | `Production Totale ÷ Moyenne Vaches Présentes`. Performance du troupeau *entier*. |
| **Production Totale (L)** | Total absolu de lait extrait. |
| **Production 305j (L)** | **Standard Industrie**: `(Production Totale ÷ Jours de Traite) × 305`. Permet de comparer des périodes différentes. |
| **Taux Perte (%)** | `(Lait Perdu ÷ Production Totale) × 100`. Indicateur de gaspillage. |
| **Jours de Traite** | Nombre de jours où des données ont été saisies. |
| **Moy. Vaches Traites** | Moyenne du nombre de vaches traites sur la période. |
| **Moy. Vaches Présentes** | Moyenne du nombre de vaches présentes sur la période. |
| **Unité / Daira** | Identifiant géographique. |

### B. Tableau Mensuel (Détails - Double-Clic)
En double-cliquant sur une ligne, on voit le détail mois par mois.

| Colonne | Signification |
| :--- | :--- |
| **Mois** | Janvier, Février... (Ordre visuel peut suivre la campagne Sept-Août). |
| **Prod. Par Hadira** | Moyenne de production par vache présente pour ce mois. |
| **Prod. Par Halia** | Moyenne de production par vache traite pour ce mois. |
| **Production (L)** | Total produit ce mois-ci. |
| **Jours** | Nombre d'enregistrements ce mois-ci (max 28-31). |
| **Lait Perdu (L)** | Quantité gaspillée ce mois-ci. |
| **Cons. Interne (L)** | `Consommation Veaux + Consommation Agneaux`. |
| **Vente (L)** | Total vendu ce mois-ci. |
| **Prix Unitaire** | Prix moyen appliqué ce mois-ci. |
| **Revenu Total** | Chiffre d'affaires du mois. |
| **Acheteurs** | Liste des acheteurs ce mois-ci. |

---

## 4. Résumé des Indicateurs Clés

*   **Rendement (Yield)** : Indicateur le plus important de l'efficacité.
    *   Si le rendement *Halia* est haut mais *Hadira* est bas → beaucoup de vaches ne produisent pas (problème de fécondité ou santé).
*   **Production 305 jours** : Standard de l'industrie laitière pour comparer les performances indépendamment de la durée de lactation.
*   **Taux de Perte** : Un taux élevé (>5%) indique des problèmes de stockage, transport, ou qualité.
*   **Consommation Interne** : Différencie la consommation des jeunes animaux (veaux/agneaux) du lait vendu ou perdu.
*   **Acheteurs** : Permet de suivre la diversification des clients et les prix par acheteur.

## 5. Année de Campagne (Sept-Août)
Le système supporte l'année agricole standard (Septembre → Août) via l'endpoint `/api/production/campaign?year=2024`.
