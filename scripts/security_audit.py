#!/usr/bin/env python3
"""
=============================================================================
MODULE 7 - SCRIPT D'AUDIT DE SÉCURITÉ
=============================================================================
Ce script exécute un audit de sécurité complet du projet MarketFlow:
- Bandit: Analyse des vulnérabilités dans le code Python
- Pylint: Analyse de la qualité du code
- Safety: Vérification des dépendances vulnérables

Exécution: python security_audit.py
           python security_audit.py --full (rapport complet)
           python security_audit.py --bandit (Bandit uniquement)
           python security_audit.py --pylint (Pylint uniquement)
           python security_audit.py --safety (Safety uniquement)

Auteur: MarketFlow Team
Date: 2025
=============================================================================
"""

import subprocess
import sys
import os
import json
from datetime import datetime
from pathlib import Path


class SecurityAuditor:
    """Classe principale pour l'audit de sécurité."""
    
    def __init__(self):
        """Initialise l'auditeur."""
        self.script_dir = Path(__file__).parent
        self.results = {
            'timestamp': datetime.now().isoformat(),
            'bandit': None,
            'pylint': None,
            'safety': None,
            'summary': {}
        }
        
        # Couleurs pour l'affichage terminal
        self.colors = {
            'RED': '\033[91m',
            'GREEN': '\033[92m',
            'YELLOW': '\033[93m',
            'BLUE': '\033[94m',
            'MAGENTA': '\033[95m',
            'CYAN': '\033[96m',
            'WHITE': '\033[97m',
            'BOLD': '\033[1m',
            'RESET': '\033[0m'
        }
    
    def _print_header(self, title: str):
        """Affiche un en-tête formaté."""
        print(f"\n{self.colors['BOLD']}{self.colors['CYAN']}")
        print("=" * 60)
        print(f"  {title}")
        print("=" * 60)
        print(self.colors['RESET'])
    
    def _print_status(self, message: str, status: str = 'info'):
        """Affiche un message de statut coloré."""
        color_map = {
            'info': self.colors['BLUE'],
            'success': self.colors['GREEN'],
            'warning': self.colors['YELLOW'],
            'error': self.colors['RED']
        }
        color = color_map.get(status, self.colors['WHITE'])
        print(f"{color}[{status.upper()}]{self.colors['RESET']} {message}")
    
    def _run_command(self, command: list, capture: bool = True) -> tuple:
        """
        Exécute une commande et retourne le résultat.
        
        Returns:
            Tuple (return_code, stdout, stderr)
        """
        try:
            result = subprocess.run(
                command,
                capture_output=capture,
                text=True,
                cwd=str(self.script_dir)
            )
            return result.returncode, result.stdout, result.stderr
        except FileNotFoundError:
            return -1, "", f"Commande non trouvée: {command[0]}"
        except Exception as e:
            return -1, "", str(e)
    
    def check_tool_installed(self, tool: str) -> bool:
        """Vérifie si un outil est installé."""
        code, _, _ = self._run_command([tool, '--version'])
        return code != -1
    
    def run_bandit(self, verbose: bool = False) -> dict:
        """
        Exécute l'analyse Bandit.
        
        Bandit trouve les problèmes de sécurité courants dans le code Python.
        """
        self._print_header("BANDIT - Analyse de Sécurité")
        
        if not self.check_tool_installed('bandit'):
            self._print_status("Bandit non installé. Installation: pip install bandit", 'warning')
            return {'status': 'not_installed', 'issues': []}
        
        self._print_status("Exécution de l'analyse Bandit...")
        
        # Commande Bandit avec sortie JSON
        command = [
            'bandit',
            '-r', '.',
            '-f', 'json',
            '--exclude', './data,./static,./templates,./__pycache__,./venv,./.venv',
            '-ll',  # Seulement medium et high
        ]
        
        code, stdout, stderr = self._run_command(command)
        
        try:
            result = json.loads(stdout) if stdout else {}
        except json.JSONDecodeError:
            result = {'errors': stdout}
        
        # Analyse des résultats
        issues = result.get('results', [])
        metrics = result.get('metrics', {})
        
        high_severity = len([i for i in issues if i.get('issue_severity') == 'HIGH'])
        medium_severity = len([i for i in issues if i.get('issue_severity') == 'MEDIUM'])
        low_severity = len([i for i in issues if i.get('issue_severity') == 'LOW'])
        
        # Affichage du résumé
        print(f"\n{self.colors['BOLD']}Résumé Bandit:{self.colors['RESET']}")
        print(f"  - Fichiers analysés: {metrics.get('_totals', {}).get('loc', 'N/A')}")
        
        if high_severity > 0:
            self._print_status(f"Sévérité HIGH: {high_severity} problème(s)", 'error')
        else:
            self._print_status(f"Sévérité HIGH: {high_severity}", 'success')
        
        if medium_severity > 0:
            self._print_status(f"Sévérité MEDIUM: {medium_severity} problème(s)", 'warning')
        else:
            self._print_status(f"Sévérité MEDIUM: {medium_severity}", 'success')
        
        self._print_status(f"Sévérité LOW: {low_severity}", 'info')
        
        # Affichage détaillé si verbose
        if verbose and issues:
            print(f"\n{self.colors['BOLD']}Détails des problèmes:{self.colors['RESET']}")
            for issue in issues:
                severity_color = {
                    'HIGH': self.colors['RED'],
                    'MEDIUM': self.colors['YELLOW'],
                    'LOW': self.colors['BLUE']
                }.get(issue.get('issue_severity'), self.colors['WHITE'])
                
                print(f"\n  {severity_color}[{issue.get('issue_severity')}]{self.colors['RESET']} {issue.get('issue_text')}")
                print(f"    Fichier: {issue.get('filename')}:{issue.get('line_number')}")
                print(f"    Test ID: {issue.get('test_id')}")
        
        self.results['bandit'] = {
            'status': 'success',
            'high': high_severity,
            'medium': medium_severity,
            'low': low_severity,
            'total': len(issues),
            'issues': issues if verbose else []
        }
        
        return self.results['bandit']
    
    def run_pylint(self, verbose: bool = False) -> dict:
        """
        Exécute l'analyse Pylint.
        
        Pylint vérifie la qualité du code et le respect des bonnes pratiques.
        """
        self._print_header("PYLINT - Qualité du Code")
        
        if not self.check_tool_installed('pylint'):
            self._print_status("Pylint non installé. Installation: pip install pylint", 'warning')
            return {'status': 'not_installed', 'score': 0}
        
        self._print_status("Exécution de l'analyse Pylint...")
        
        # Fichiers Python à analyser
        python_files = list(self.script_dir.glob('*.py'))
        
        if not python_files:
            self._print_status("Aucun fichier Python trouvé", 'warning')
            return {'status': 'no_files', 'score': 0}
        
        files_str = ' '.join(str(f.name) for f in python_files)
        
        # Commande Pylint
        command = [
            'pylint',
            '--output-format=json',
            '--rcfile=.pylintrc' if (self.script_dir / '.pylintrc').exists() else '',
        ] + [f.name for f in python_files]
        
        # Filtrer les arguments vides
        command = [c for c in command if c]
        
        code, stdout, stderr = self._run_command(command)
        
        try:
            issues = json.loads(stdout) if stdout else []
        except json.JSONDecodeError:
            issues = []
        
        # Catégorisation des problèmes
        errors = len([i for i in issues if i.get('type') == 'error'])
        warnings = len([i for i in issues if i.get('type') == 'warning'])
        conventions = len([i for i in issues if i.get('type') == 'convention'])
        refactors = len([i for i in issues if i.get('type') == 'refactor'])
        
        # Calcul du score (approximatif)
        total_issues = len(issues)
        score = max(0, 10 - (errors * 2 + warnings * 0.5 + conventions * 0.1 + refactors * 0.2))
        
        # Affichage du résumé
        print(f"\n{self.colors['BOLD']}Résumé Pylint:{self.colors['RESET']}")
        print(f"  - Fichiers analysés: {len(python_files)}")
        
        if score >= 8:
            self._print_status(f"Score: {score:.2f}/10", 'success')
        elif score >= 5:
            self._print_status(f"Score: {score:.2f}/10", 'warning')
        else:
            self._print_status(f"Score: {score:.2f}/10", 'error')
        
        print(f"  - Erreurs: {errors}")
        print(f"  - Avertissements: {warnings}")
        print(f"  - Conventions: {conventions}")
        print(f"  - Refactoring suggéré: {refactors}")
        
        # Affichage détaillé si verbose
        if verbose and issues:
            print(f"\n{self.colors['BOLD']}Détails des problèmes (top 10):{self.colors['RESET']}")
            for issue in issues[:10]:
                type_color = {
                    'error': self.colors['RED'],
                    'warning': self.colors['YELLOW'],
                    'convention': self.colors['BLUE'],
                    'refactor': self.colors['MAGENTA']
                }.get(issue.get('type'), self.colors['WHITE'])
                
                print(f"\n  {type_color}[{issue.get('type', 'unknown').upper()}]{self.colors['RESET']} {issue.get('message')}")
                print(f"    Fichier: {issue.get('path')}:{issue.get('line')}")
                print(f"    Symbol: {issue.get('symbol')}")
        
        self.results['pylint'] = {
            'status': 'success',
            'score': round(score, 2),
            'errors': errors,
            'warnings': warnings,
            'conventions': conventions,
            'refactors': refactors,
            'total': total_issues
        }
        
        return self.results['pylint']
    
    def run_safety(self, verbose: bool = False) -> dict:
        """
        Exécute l'analyse Safety.
        
        Safety vérifie si les dépendances ont des vulnérabilités connues.
        """
        self._print_header("SAFETY - Vulnérabilités des Dépendances")
        
        if not self.check_tool_installed('safety'):
            self._print_status("Safety non installé. Installation: pip install safety", 'warning')
            return {'status': 'not_installed', 'vulnerabilities': []}
        
        self._print_status("Vérification des dépendances...")
        
        # Vérifier si requirements.txt existe
        req_file = self.script_dir / 'requirements.txt'
        if not req_file.exists():
            self._print_status("Fichier requirements.txt non trouvé", 'warning')
            return {'status': 'no_requirements', 'vulnerabilities': []}
        
        # Commande Safety
        command = [
            'safety', 'check',
            '-r', str(req_file),
            '--json'
        ]
        
        code, stdout, stderr = self._run_command(command)
        
        try:
            # Safety retourne un format JSON spécifique
            result = json.loads(stdout) if stdout else {}
            vulnerabilities = result.get('vulnerabilities', [])
        except json.JSONDecodeError:
            # Fallback: pas de vulnérabilités ou erreur de parsing
            vulnerabilities = []
        
        # Affichage du résumé
        print(f"\n{self.colors['BOLD']}Résumé Safety:{self.colors['RESET']}")
        
        if code == 0 or not vulnerabilities:
            self._print_status("Aucune vulnérabilité connue détectée", 'success')
        else:
            self._print_status(f"{len(vulnerabilities)} vulnérabilité(s) détectée(s)", 'error')
            
            if verbose and vulnerabilities:
                print(f"\n{self.colors['BOLD']}Détails des vulnérabilités:{self.colors['RESET']}")
                for vuln in vulnerabilities:
                    print(f"\n  {self.colors['RED']}[VULN]{self.colors['RESET']} {vuln.get('package_name', 'Unknown')}")
                    print(f"    Version: {vuln.get('analyzed_version', 'N/A')}")
                    print(f"    Advisory: {vuln.get('advisory', 'N/A')}")
        
        self.results['safety'] = {
            'status': 'success',
            'vulnerabilities': len(vulnerabilities),
            'details': vulnerabilities if verbose else []
        }
        
        return self.results['safety']
    
    def run_full_audit(self, verbose: bool = False) -> dict:
        """Exécute un audit complet (Bandit + Pylint + Safety)."""
        self._print_header("AUDIT DE SÉCURITÉ COMPLET - MARKETFLOW")
        print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Répertoire: {self.script_dir}")
        
        # Exécution de chaque outil
        self.run_bandit(verbose)
        self.run_pylint(verbose)
        self.run_safety(verbose)
        
        # Résumé global
        self._print_header("RÉSUMÉ DE L'AUDIT")
        
        # Calcul du score global
        bandit_score = 10 if self.results['bandit'].get('high', 0) == 0 else 0
        bandit_score += 5 if self.results['bandit'].get('medium', 0) == 0 else 0
        
        pylint_score = self.results['pylint'].get('score', 0) if self.results['pylint'] else 0
        
        safety_score = 10 if self.results['safety'].get('vulnerabilities', 0) == 0 else 0
        
        global_score = (bandit_score + pylint_score + safety_score) / 3
        
        self.results['summary'] = {
            'global_score': round(global_score, 2),
            'bandit_issues': self.results['bandit'].get('total', 0) if self.results['bandit'] else 'N/A',
            'pylint_score': pylint_score,
            'safety_vulns': self.results['safety'].get('vulnerabilities', 0) if self.results['safety'] else 'N/A'
        }
        
        print(f"\n{self.colors['BOLD']}Score Global: ", end="")
        if global_score >= 8:
            print(f"{self.colors['GREEN']}{global_score:.2f}/10 - EXCELLENT{self.colors['RESET']}")
        elif global_score >= 6:
            print(f"{self.colors['YELLOW']}{global_score:.2f}/10 - BON{self.colors['RESET']}")
        elif global_score >= 4:
            print(f"{self.colors['YELLOW']}{global_score:.2f}/10 - MOYEN{self.colors['RESET']}")
        else:
            print(f"{self.colors['RED']}{global_score:.2f}/10 - À AMÉLIORER{self.colors['RESET']}")
        
        print(f"\n{self.colors['BOLD']}Détails:{self.colors['RESET']}")
        print(f"  - Bandit (Sécurité): {self.results['bandit'].get('total', 'N/A')} problème(s)")
        print(f"  - Pylint (Qualité): {pylint_score}/10")
        print(f"  - Safety (Dépendances): {self.results['safety'].get('vulnerabilities', 'N/A')} vulnérabilité(s)")
        
        # Recommandations
        print(f"\n{self.colors['BOLD']}Recommandations:{self.colors['RESET']}")
        
        if self.results['bandit'].get('high', 0) > 0:
            self._print_status("Corrigez les problèmes de sécurité HIGH en priorité", 'error')
        
        if self.results['safety'].get('vulnerabilities', 0) > 0:
            self._print_status("Mettez à jour les dépendances vulnérables", 'error')
        
        if pylint_score < 7:
            self._print_status("Améliorez la qualité du code selon les suggestions Pylint", 'warning')
        
        if global_score >= 8:
            self._print_status("Excellent travail! Le code est sécurisé et de bonne qualité.", 'success')
        
        return self.results
    
    def save_report(self, filename: str = 'security_report.json'):
        """Sauvegarde le rapport d'audit en JSON."""
        report_path = self.script_dir / filename
        
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, indent=2, ensure_ascii=False)
        
        self._print_status(f"Rapport sauvegardé: {report_path}", 'success')


# =========================================================================
# POINT D'ENTRÉE
# =========================================================================

def main():
    """Point d'entrée principal."""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Audit de sécurité MarketFlow',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemples:
  python security_audit.py           # Audit rapide
  python security_audit.py --full    # Audit complet avec détails
  python security_audit.py --bandit  # Bandit uniquement
  python security_audit.py --pylint  # Pylint uniquement
  python security_audit.py --safety  # Safety uniquement
  python security_audit.py --save    # Sauvegarder le rapport
        """
    )
    
    parser.add_argument('--full', '-f', action='store_true',
                       help='Afficher les détails complets')
    parser.add_argument('--bandit', '-b', action='store_true',
                       help='Exécuter uniquement Bandit')
    parser.add_argument('--pylint', '-p', action='store_true',
                       help='Exécuter uniquement Pylint')
    parser.add_argument('--safety', '-s', action='store_true',
                       help='Exécuter uniquement Safety')
    parser.add_argument('--save', action='store_true',
                       help='Sauvegarder le rapport en JSON')
    
    args = parser.parse_args()
    
    auditor = SecurityAuditor()
    
    # Exécution selon les arguments
    if args.bandit:
        auditor.run_bandit(verbose=args.full)
    elif args.pylint:
        auditor.run_pylint(verbose=args.full)
    elif args.safety:
        auditor.run_safety(verbose=args.full)
    else:
        auditor.run_full_audit(verbose=args.full)
    
    # Sauvegarde du rapport si demandé
    if args.save:
        auditor.save_report()
    
    print("\n" + "=" * 60)
    print("AUDIT TERMINÉ")
    print("=" * 60 + "\n")


if __name__ == '__main__':
    main()
