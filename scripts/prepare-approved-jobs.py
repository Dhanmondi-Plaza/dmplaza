"""Prepare approved DOCX job descriptions for the existing Supabase hiring.jobs table."""
import hashlib
import io
import json
import sys
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
SOURCE = Path(sys.argv[1])
OUT = Path(sys.argv[2])


def paragraphs(data):
    with zipfile.ZipFile(io.BytesIO(data)) as doc:
        root = ET.fromstring(doc.read('word/document.xml'))
    return [s for p in root.iter(W + 'p') if (s := ''.join(t.text or '' for t in p.iter(W + 't')).strip())]


def section(ps, start, stops):
    i = ps.index(start) + 1
    end = min([ps.index(stop, i) for stop in stops if stop in ps[i:]] or [len(ps)])
    return ps[i:end]


def formatted(ps, headings):
    out = []
    for p in ps:
        out.append(p if p in headings or not out else '• ' + p)
    return '\n'.join(out)


records = []
with zipfile.ZipFile(SOURCE) as archive:
    for filename in archive.namelist():
        raw = archive.read(filename)
        ps = paragraphs(raw)
        title = ps[0]
        source = {'filename': filename, 'sha256': hashlib.sha256(raw).hexdigest(), 'paragraphs': ps}
        if filename.startswith('01_Lead_Barista'):
            description = formatted(section(ps, 'Position Summary', ['Hard Skills and Technical Requirements']), {'What This Role Owns'})
            description += '\n\n' + formatted(section(ps, 'Brand and Marketing Expectations', ['Application Requirements']), {'Brand and Marketing Expectations'})
            description += '\n\n' + formatted(section(ps, 'Why Join Pearl & Leaf', ['Lead Barista Hiring Flow']), {'Why Join Pearl & Leaf', 'The role offers:'})
            requirements = 'Hard Skills and Technical Requirements\n' + formatted(section(ps, 'Hard Skills and Technical Requirements', ['Brand and Marketing Expectations']), {'Soft Skills We Value'})
            requirements += '\n\n' + formatted(section(ps, 'Preferred Qualifications', ['What Success Looks Like']), {'Preferred Qualifications'})
            questions = [{'id':'beverage-development','type':'textarea','label':'Tell us about a beverage you developed or significantly improved. What did you change, why, and what was the result?','required':True}]
            record = dict(slug='lead-barista', title=title, business_id='243416bd-ef57-55ea-be65-500bde2946a1', team='Beverage', employment_type='Full-time', compensation='$25–$29 per hour plus tips', openings=1, portfolio_required=False, linkedin_required=False, application_instructions='Apply using the form on this page. A résumé is required. A link or PDFs showing drinks, menus, or recipes you created are welcome but optional.')
        elif filename.startswith('02_Content_and_Community_Manager'):
            description = formatted(section(ps, 'Position Summary', ['Hard Skills and Experience']), {'Core Responsibilities', 'What This Role Is Not'})
            description += '\n\n' + formatted(section(ps, 'What Success Looks Like', ['Application Instructions']), {'What Success Looks Like'})
            requirements = 'Hard Skills and Experience\n' + formatted(section(ps, 'Hard Skills and Experience', ['Application Requirements']), {'Community and Partnership Skills', 'Soft Skills We Value', 'On-Camera Expectations'})
            requirements += '\n\n' + formatted(section(ps, 'Preferred Qualifications', ['What Success Looks Like']), {'Preferred Qualifications'})
            questions = [
                {'id':'portfolio-contribution','type':'textarea','label':'What did you personally contribute to the work in your portfolio?','required':True},
                {'id':'best-story','type':'textarea','label':'In 100 words or fewer, which piece best represents your storytelling ability, and why?','required':True},
                {'id':'performance-example','type':'textarea','label':'Give one example of content you created that performed well. What happened, what drove the result, and what did you learn?','required':True},
                {'id':'raw-footage','type':'textarea','label':'If we gave you raw DM Plaza footage, how would you turn it into useful content? No editing or production is required for this application.','required':True,'helpText':'Describe the story angle, hook, structure, additional footage or interviews, format, and how you would judge success.'},
                {'id':'camera-comfort','type':'yesno','label':'Are you comfortable filming and interviewing people, editing content, and appearing on camera when appropriate?','required':True},
                {'id':'weekend-coverage','type':'yesno','label':'Can you cover occasional weekend events when scheduled in advance?','required':True},
            ]
            record = dict(slug='content-community-manager', title=title, business_id='15182148-7439-5c1f-bb14-ba35425c0939', team='Marketing / Community', employment_type='Full-time', compensation='$75,000–$90,000 per year', openings=1, portfolio_required=True, linkedin_required=False, application_instructions='Apply using the form on this page. A résumé and portfolio link are required. Answer the role-specific questions below.')
        elif filename.startswith('12_Executive_Chef_Practical_Assessment_Judge'):
            description = formatted(section(ps, 'Position Summary', ['Required Qualifications']), {'Key Responsibilities', 'Scoring and Feedback'})
            description += '\n\n' + formatted(section(ps, 'Cuisine Background', ['Compensation']), {'Cuisine Background'})
            description += '\n\n' + formatted(section(ps, 'Independence and Conflict of Interest', ['Preferred Qualifications']), {'Independence and Conflict of Interest', 'Expected Deliverables'})
            requirements = 'Required Qualifications\n' + formatted(section(ps, 'Required Qualifications', ['Cuisine Background']), {'Required Qualifications'})
            requirements += '\n\n' + formatted(section(ps, 'Required Soft Skills', ['Independence and Conflict of Interest']), {'Required Soft Skills'})
            requirements += '\n\n' + formatted(section(ps, 'Preferred Qualifications', ['Application Instructions']), {'Preferred Qualifications'})
            questions = [
                {'id':'judge-availability','type':'yesno','label':'Can you attend a full, one-day, in-person culinary assessment in Jamaica, Queens?','required':True},
                {'id':'judge-evaluation','type':'textarea','label':'Tell us briefly about your experience assessing, mentoring, training, or hiring chefs.','required':True},
                {'id':'judge-conflict','type':'textarea','label':'Do you know any current Executive Chef candidate or have a relationship that might affect your independence? If none, write “None.”','required':True},
            ]
            record = dict(slug='executive-chef-practical-assessment-judge', title=title, business_id='4e200f41-222d-5dfa-be0c-e07b99c66b96', team='Culinary / Assessment', employment_type='Contract', compensation='$75–$150 per hour for a one-day engagement', openings=2, portfolio_required=False, linkedin_required=False, application_instructions='Apply using the form on this page. A résumé or professional culinary profile is required; relevant certifications may be uploaded as PDFs.')
        else:
            continue
        record.update(location='Jamaica, Queens, New York', description=description, requirements=requirements, questions=questions, resume_required=True, source_document=source, visibility='listed')
        records.append(record)

if len(sys.argv) > 3:
    chef_path = Path(sys.argv[3])
    raw = chef_path.read_bytes()
    ps = paragraphs(raw)
    if ps[0] != 'Executive Chef' or 'DO NOT POST' not in ps:
        raise ValueError('Unexpected Executive Chef document structure')
    description = formatted(section(ps, 'Position Summary', ['Required Qualifications']), {'Key Responsibilities'})
    description += '\n\n' + formatted(section(ps, 'Why Join Desi Dragon', ['Application Instructions']), {'Why Join Desi Dragon', 'The role offers:'})
    requirements = 'Required Qualifications\n' + formatted(section(ps, 'Required Qualifications', ['Hiring Process']), {'Core Soft Skills'})
    requirements += '\n\n' + formatted(section(ps, 'Preferred Qualifications', ['Situational Question']), {'Preferred Qualifications'})
    situation = section(ps, 'Situational Question', ['Why Join Desi Dragon'])
    questions = [{'id':'chef-situation','type':'textarea','label':'How would you handle a delayed dinner service, a Line Cook callout, a returned dish, and a station that is not following the recipe?','helpText':'\n'.join(situation),'required':True}]
    records.append(dict(slug='executive-chef', title='Executive Chef', business_id='4e200f41-222d-5dfa-be0c-e07b99c66b96', team='Kitchen', employment_type='Full-time', compensation='$95,000–$115,000 base salary plus performance bonus', openings=1, portfolio_required=False, linkedin_required=False, application_instructions='Apply using the form on this page. A résumé is required. A brief cover note and menu samples, food photos, or portfolio materials are welcome but optional.', location='Jamaica, Queens, New York', description=description, requirements=requirements, questions=questions, resume_required=True, source_document={'filename': chef_path.name, 'sha256': hashlib.sha256(raw).hexdigest(), 'paragraphs': ps[:ps.index('DO NOT POST')]}, visibility='listed'))

OUT.write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'Prepared {len(records)} jobs in {OUT}')
