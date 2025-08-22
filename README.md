# SIFT Toolbox: Software and Systems Analysis Framework

## Purpose

SIFT (Software/Systems Iterative Forensic Toolkit) is a systematic technical analysis tool designed to comprehensively review software requirements, designs, code, and technical challenges. It provides a structured methodology for assessing technical artifacts with rigorous evaluation criteria.

## Technical Architecture

- **Frontend**: React 19 with TypeScript
- **AI Integration**: Google Gemini AI (Gemini 1.5 Flash model)
- **Analysis Framework**: Structured 8-section technical review process

## Functionality

When presented with technical documentation, code, or system specifications, SIFT performs the following systematic analysis:

1. **Verified Specifications**: Confirms and rates existing requirements and components
2. **Issues & Risks Assessment**: Identifies potential technical problems with severity ratings
3. **Improvement Summary**: Highlights key findings and recommended actions
4. **Optimization Opportunities**: Suggests potential technological enhancements
5. **Resource Evaluation**: Assesses tools, libraries, and documentation reliability
6. **System Overview**: Provides a refined technical description
7. **Technical Feasibility**: Evaluates overall solution viability
8. **Best Practice Recommendations**: Offers actionable development guidance

## Key Analysis Principles

- Objective, evidence-based technical review
- Systematic documentation of findings
- Continuous self-critique of analysis
- Emphasis on technical precision

## Setup Instructions

### Prerequisites
- Node.js
- Gemini API Key

### Installation Steps
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure API key:
   - Open `.env.local`
   - Set `GEMINI_API_KEY` to your Google AI Studio API key

4. Launch development server:
   ```bash
   npm run dev
   ```

## Evidence Evaluation Criteria

SIFT uses a 1-5 rating scale for technical evidence:
- 5: Formal, approved specifications
- 4: Peer-reviewed code, comprehensive tests
- 3: Official documentation, benchmark analyses
- 2: Community consensus, best practices
- 1: Anecdotal reports, unverified claims

## Limitations

- AI-generated analysis may contain errors
- Requires human review and validation
- Dependent on quality of input materials

## Deployment

View current application: https://ai.studio/apps/drive/17gHA0Pf6dpEVADv7FOHH6j17hROQx9dT