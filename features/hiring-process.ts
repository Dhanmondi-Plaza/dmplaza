// Candidate-facing summaries of the hiring flows in the approved job documents.
// Keep internal scorecards, interviewer assignments, and evaluation notes private.
export const hiringProcessBySlug: Record<string, string[]> = {
  'executive-chef': [
    'Application and résumé review, including any optional menu or food examples.',
    'A structured interview about culinary leadership, Indian and Chinese cuisine, team development, and kitchen judgment.',
    'Finalists complete a practical culinary assessment. We will explain its format and main evaluation criteria in advance.',
    'Final review and reference checks before a hiring decision.',
  ],
  'lead-barista': [
    'Application review, including your example of a drink you developed or improved and any optional work samples.',
    'A 20-minute screening conversation, followed by a 45-minute review of your drink concepts and personal contributions.',
    'Finalists complete a paid on-site beverage practical, including recipe documentation so another barista could reproduce a drink.',
    'Final decision and reference checks.',
  ],
  'content-community-manager': [
    'Portfolio and application review, followed by a structured interview about your personal contribution to the work shown.',
    'A live discussion of content, founder-story, and community scenarios. The initial application does not require you to produce or edit content.',
    'Finalists complete a paid on-site field test involving observation, filming, and a short-form content piece.',
    'Final debrief and reference checks.',
  ],
  'junior-cook': [
    'Application review focused on relevant experience, reliability, and willingness to learn.',
    'A short screening interview.',
    'Finalists may complete a practical kitchen-skills assessment. We will explain the format in advance.',
    'Team-fit discussion and reference checks before a hiring decision.',
  ],
  'mocktail-bartender-beverage-specialist': [
    'Application and optional beverage-work review, followed by a screening interview.',
    'A discussion of beverages you personally developed or improved and the choices behind them.',
    'Finalists may complete a paid practical beverage assessment. We will explain the format and criteria in advance.',
    'Final interview, reference checks, and hiring decision.',
  ],
  'dishwasher-kitchen-steward': [
    'Application review focused on sanitation, reliability, and relevant kitchen experience.',
    'A short screening interview.',
    'Finalists may complete a short practical work assessment. We will explain the format and expectations in advance.',
    'Reliability and team-fit discussion, then reference checks before a hiring decision.',
  ],
  'maintenance-team-member': [
    'Application review focused on safety, preventive maintenance, and relevant experience.',
    'A structured screening interview about troubleshooting and when to escalate a problem.',
    'Finalists may complete a practical assessment of basic, non-licensed maintenance tasks. We will explain the format and criteria in advance.',
    'Safety and team-fit discussion, then reference checks before a hiring decision.',
  ],
  'executive-chef-practical-assessment-judge': [
    'Application review of your culinary background and professional experience.',
    'Selected professionals may have a brief discussion to confirm availability, compensation, and potential conflicts of interest.',
    'The engagement is an in-person, one-day assessment. Judges submit independent scores and written observations.',
  ],
};
