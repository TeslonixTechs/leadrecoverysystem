/**
 * Service Classification Service
 * Analyzes customer problem descriptions and maps them to configured business services.
 * 
 * Architecture note: Uses a deterministic rule-based heuristic for MVP.
 * Designed with an async abstraction so an LLM provider (e.g. Gemini/OpenAI) 
 * can easily augment or replace this module in the future.
 */

const CLASSIFICATION_RULES = [
  {
    keywords: ['storm', 'hail', 'wind', 'blown off', 'blown', 'tornado', 'tree branch', 'hurricane', 'heavy rain'],
    category: 'storm',
    nameMatches: ['storm', 'damage', 'inspection']
  },
  {
    keywords: ['leak', 'leaking', 'drip', 'dripping', 'water', 'ceiling', 'hole', 'shingle', 'spot', 'patch'],
    category: 'repair',
    nameMatches: ['repair', 'leak']
  },
  {
    keywords: ['replace', 'replacement', 'new roof', 'old roof', 're-roof', 'reroof', 'tear off', 'overhaul', 'age'],
    category: 'replacement',
    nameMatches: ['replacement', 'consultation']
  },
  {
    keywords: ['gutter', 'downspout', 'clog', 'clogged', 'eaves', 'drainage', 'water flow'],
    category: 'gutter',
    nameMatches: ['gutter']
  },
  {
    keywords: ['inspect', 'inspection', 'check', 'examine', 'look at', 'assessment', 'audit', 'condition', 'eval'],
    category: 'inspection',
    nameMatches: ['inspection']
  }
];

/**
 * Classifies a customer problem description to select the best matching service from business services.
 * @param {string} description - Problem text from customer intake.
 * @param {Array} services - Available active services for the business.
 * @returns {Object} { suggestedServiceId, suggestedServiceName, confidence, rationale }
 */
async function classifyProblem(description = '', services = []) {
  if (!services || services.length === 0) {
    return {
      suggestedServiceId: null,
      suggestedServiceName: null,
      confidence: 0,
      rationale: 'No active services available.'
    };
  }

  const text = description.toLowerCase().trim();

  // Calculate scores for each rule category based on keyword matches
  const categoryScores = {};

  for (const rule of CLASSIFICATION_RULES) {
    let matches = 0;
    for (const kw of rule.keywords) {
      if (text.includes(kw)) {
        matches += (rule.category === 'storm' ? 2 : 1);
      }
    }
    if (matches > 0) {
      categoryScores[rule.category] = matches;
    }
  }

  // Find category with highest match score
  let bestCategory = null;
  let maxScore = 0;
  for (const [cat, score] of Object.entries(categoryScores)) {
    if (score > maxScore) {
      maxScore = score;
      bestCategory = cat;
    }
  }

  if (bestCategory) {
    const targetRule = CLASSIFICATION_RULES.find(r => r.category === bestCategory);
    
    let matchedService = null;
    let maxMatchCount = 0;

    for (const svc of services) {
      const svcName = svc.name.toLowerCase();
      let matchCount = 0;
      for (const nm of targetRule.nameMatches) {
        if (svcName.includes(nm)) {
          matchCount += 1;
        }
      }
      if (matchCount > maxMatchCount) {
        maxMatchCount = matchCount;
        matchedService = svc;
      }
    }

    if (matchedService) {
      return {
        suggestedServiceId: matchedService.id,
        suggestedServiceName: matchedService.name,
        confidence: Math.min(0.95, 0.6 + maxScore * 0.15),
        rationale: `Matched category "${bestCategory}" based on keywords in description.`
      };
    }
  }

  // Fallback: If no strong keyword match, pick default/first service
  const defaultService = services.find(s => s.name.toLowerCase().includes('repair')) || services[0];

  return {
    suggestedServiceId: defaultService.id,
    suggestedServiceName: defaultService.name,
    confidence: 0.4,
    rationale: 'Default service recommended based on standard customer intake requests.'
  };
}

module.exports = {
  classifyProblem
};
