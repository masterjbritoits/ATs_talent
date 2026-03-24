# Scoring Engine

## Default Weights
- Required skill match: 30
- Optional skill match: 10
- Years of experience: 15
- Language match: 10
- Location fit: 5
- Title/seniority relevance: 10
- Domain relevance: 10
- CV quality/completeness: 5
- Recruiter custom factor: 5

## Recommendations
- `>= 75`: Advance
- `45-74`: Manual Review
- `< 45`: Reject

## Ranking
- Primary sort: score descending
- Secondary sort: updated recency
- Ranking position stored on `Application`
