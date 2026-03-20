# Vesta Backend Copilot Instructions

## Project Context
- This repository hosts the Vesta Immo backend.
- Domain focus: real-estate financial simulations for individuals.
- Core business areas:
  - Borrowing capacity
  - Target budget
  - Notary fees

## Product Context Source
- Canonical product context reference:
  - https://github.com/Vesta-Immo/.github/blob/main/profile/README.md
- Use this source to align terminology, product framing, and user-facing assumptions.
- If product intent is ambiguous, explicitly call out assumptions instead of inventing details.

## Global Engineering Priorities
- Prioritize readability, maintainability, and testability over clever code.
- Prefer explicit, small, and composable modules.
- Keep business logic deterministic and framework-agnostic when possible.
- Avoid mixing domain rules with transport or persistence concerns.

## NestJS Architecture Rules
- Use modular boundaries by business capability (not by technical layer only).
- Keep controllers thin: input/output mapping only.
- Put orchestration in application services (use-case oriented).
- Put pure business rules in domain services/entities/value objects.
- Keep infrastructure adapters isolated behind interfaces.
- Favor dependency inversion: domain/application must not depend on infrastructure details.

## Layering Expectations
- Domain layer:
  - Pure business rules and invariants.
  - No NestJS decorators unless strictly required.
  - No direct HTTP, database, or external API dependencies.
- Application layer:
  - Use-case orchestration.
  - Transaction and workflow coordination.
  - Calls domain logic and repository interfaces.
- Infrastructure layer:
  - Concrete repositories, external services, persistence mapping.
  - Framework and provider-specific integration.

## API Design Guidelines
- Design stable and versionable REST contracts.
- Use explicit DTOs for request and response payloads.
- Validate all input with DTO validation + pipes.
- Return consistent error shapes and meaningful HTTP codes.
- Preserve backward compatibility for public endpoints.

## Business Rules and Financial Calculations
- Always separate business formulas from technical implementation details.
- Make assumptions explicit in code comments and documentation.
- Prefer precise decimal handling for monetary values; avoid unsafe floating-point shortcuts.
- Include boundary and edge-case handling for all financial computations.

## Validation, Error Handling, and Observability
- Validate all external inputs at boundaries.
- Use guards for auth/authz and enforce least privilege.
- Use filters/interceptors for standardized error responses and logging.
- Never leak sensitive technical internals in public error messages.

## Testing Requirements
- Any non-trivial change must include tests.
- Prioritize tests for financial formulas and API validation paths.
- Minimum expected coverage per feature:
  - Unit tests for domain and application services.
  - Integration tests for persistence and module wiring when relevant.
  - E2E tests for critical user flows.
- Tests must be deterministic, isolated, and readable.

## Security Baseline
- Consider OWASP API risks in all backend changes.
- Enforce strict input validation and output sanitization where applicable.
- Do not hardcode secrets or credentials.
- Use secure defaults for configuration and authentication.
- Log security-relevant events without exposing personal data.

## Code Review Focus
- Focus feedback on:
  - Bugs and behavioral regressions
  - Domain correctness
  - Missing or weak tests
  - Security and data protection risks
- De-prioritize purely stylistic comments unless they affect clarity or maintenance.

## Assistant Response Expectations
When proposing architecture or implementation plans, prefer this structure:
1. Decisions
2. Proposed structure
3. Request-response flow
4. Risks and alternatives

When reviewing code, prefer this structure:
1. Critical findings
2. Moderate risks
3. Missing tests
4. Targeted fixes
