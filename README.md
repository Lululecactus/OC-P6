# JustStreamIt

JustStreamIt est une interface web responsive qui permet de consulter les
films les mieux notés. Elle a été réalisée dans le cadre du projet 6 du
parcours Développeur Python d'OpenClassrooms.

Les classements et les fiches détaillées sont chargés depuis l'API locale
[OCMovies](https://github.com/OpenClassrooms-Student-Center/OCMovies-API-EN-FR).

## Fonctionnalités

- affichage du meilleur film et des films les mieux notés ;
- catégories Mystery et Action alimentées par l'API ;
- choix d'une catégorie supplémentaire parmi les genres disponibles ;
- affichage adapté aux formats mobile, tablette et ordinateur ;
- boutons « Voir plus / Voir moins » sur mobile et tablette ;
- fiche détaillée de chaque film dans une fenêtre modale ;
- navigation au clavier et prise en charge de la réduction des animations.

## Technologies

- HTML5 sémantique ;
- CSS3 natif, avec Flexbox, Grid et media queries ;
- JavaScript vanilla utilisant les modules ES et l'API `fetch` ;
- API REST OCMovies exécutée localement.

Aucun framework JavaScript ou plugin tiers n'est utilisé.

## Prérequis

- Git ;
- Python 3 ;
- un navigateur web récent.

## Installation

Clonez le projet puis placez-vous dans son dossier :

```bash
git clone https://github.com/Lululecactus/OC-P6.git
cd OC-P6
```

Clonez ensuite l'API OCMovies à la racine du projet :

```bash
git clone https://github.com/OpenClassrooms-Student-Center/OCMovies-API-EN-FR.git
cd OCMovies-API-EN-FR
```

### macOS et Linux

```bash
python3 -m venv env
source env/bin/activate
python3 -m pip install -r requirements.txt
python3 manage.py create_db
python3 manage.py runserver
```

### Windows

```powershell
py -m venv env
.\env\Scripts\Activate.ps1
py -m pip install -r requirements.txt
py manage.py create_db
py manage.py runserver
```

La commande `create_db` est uniquement nécessaire lors de la première
installation. L'API est ensuite disponible à l'adresse
[http://127.0.0.1:8000/api/v1/titles/](http://127.0.0.1:8000/api/v1/titles/).

## Lancement de l'interface

Laissez l'API fonctionner et ouvrez un second terminal à la racine du projet
JustStreamIt :

```bash
python3 -m http.server 5500
```

Sous Windows, la commande équivalente est :

```powershell
py -m http.server 5500
```

Ouvrez ensuite [http://127.0.0.1:5500/](http://127.0.0.1:5500/) dans votre
navigateur.

L'extension Live Server de Visual Studio Code peut également servir le projet.

## Lancements suivants

Pour relancer l'API sur macOS ou Linux :

```bash
cd OCMovies-API-EN-FR
source env/bin/activate
python3 manage.py runserver
```

Il n'est pas nécessaire de réinstaller les dépendances ni de recréer la base
de données.

## Organisation du projet

```text
.
├── assets/
│   └── images/      # Logo et images de secours
├── css/
│   └── style.css   # Mise en page responsive et animations
├── js/
│   ├── api.js      # Requêtes et gestion des erreurs de l'API
│   └── main.js     # Rendu et interactions de l'interface
├── index.html         # Structure sémantique de la page
└── README.md
```

Le dossier `OCMovies-API-EN-FR` et son environnement virtuel sont exclus du
dépôt Git : l'API reste une dépendance externe au projet front-end.

## Qualité et accessibilité

- HTML et CSS validés avec les outils du W3C ;
- textes et intitulés accessibles aux technologies d'assistance ;
- focus clavier visible sur les éléments interactifs ;
- animations désactivées lorsque `prefers-reduced-motion` est activé ;
- contenu de remplacement lorsqu'une affiche distante est indisponible.
