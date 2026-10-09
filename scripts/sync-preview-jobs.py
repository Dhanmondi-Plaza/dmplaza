"""Mirror imported roles into the local, non-submitting preview."""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
new_jobs = json.loads((root / 'approved-new-jobs.json').read_text(encoding='utf-8'))
preview_file = root / 'features' / 'approved-jobs.json'
preview = json.loads(preview_file.read_text(encoding='utf-8'))
ids = {
    'lead-barista': '3996191e-e8d0-4d53-9271-5e5937ef4df0',
    'content-community-manager': '6cca9b15-2161-4985-9a32-e5df3bcc1a89',
    'executive-chef-practical-assessment-judge': '3c185a20-1ea7-444a-b828-faf344c7d243',
    'executive-chef': '9b1307ac-3a9a-4130-9a4e-2b97cf7f6025',
}
brand = {
    'lead-barista': 'Pearl & Leaf',
    'content-community-manager': 'DM Plaza',
    'executive-chef-practical-assessment-judge': 'Desi Dragon',
    'executive-chef': 'Desi Dragon',
}
for job in new_jobs:
    slug = job['slug']
    public = {key: job[key] for key in ('slug', 'title', 'team', 'location', 'employment_type', 'description', 'requirements', 'compensation', 'openings', 'questions', 'resume_required', 'application_instructions', 'portfolio_required', 'linkedin_required')}
    public.update(id=ids[slug], brand=brand[slug], visibility='draft', version=1, created_at='2026-10-08T22:00:00Z')
    preview = [old for old in preview if old['slug'] != slug]
    preview.append(public)
preview_file.write_text(json.dumps(preview, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'Preview now contains {len(preview)} roles.')
