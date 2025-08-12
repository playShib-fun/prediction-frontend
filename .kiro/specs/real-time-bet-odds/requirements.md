# Requirements Document

## Introduction

This feature enhances the game card component to display real-time bet odds that are calculated using the GetAllRounds GraphQL endpoint. The odds will be queried at 15-second intervals and updated with smooth animations to provide users with the most current betting information for upcoming rounds.

## Requirements

### Requirement 1

**User Story:** As a user viewing upcoming game rounds, I want to see real-time bet odds that update automatically, so that I can make informed betting decisions based on the latest pool information.

#### Acceptance Criteria

1. WHEN viewing an upcoming game card THEN the system SHALL display current bet odds for both bull (higher) and bear (lower) positions
2. WHEN the bet odds change due to new bets THEN the system SHALL update the displayed odds within 15 seconds
3. WHEN bet odds update THEN the system SHALL animate the transition smoothly to draw user attention to the change
4. WHEN no bets have been placed for a position THEN the system SHALL display 1.00x odds for that position

### Requirement 2

**User Story:** As a user, I want the bet odds to be calculated from the most current data available, so that I can trust the accuracy of the information when making betting decisions.

#### Acceptance Criteria

1. WHEN calculating bet odds THEN the system SHALL use the GetAllRounds GraphQL endpoint to fetch the latest round data
2. WHEN fetching round data THEN the system SHALL query the endpoint every 15 seconds automatically
3. WHEN round data is received THEN the system SHALL calculate odds using the formula: total pool amount / position amount
4. WHEN a position has zero bets THEN the system SHALL default the odds to 1.00x to prevent division by zero

### Requirement 3

**User Story:** As a user, I want the odds display to be visually appealing and clearly indicate when values have changed, so that I can quickly notice important updates.

#### Acceptance Criteria

1. WHEN bet odds update THEN the system SHALL animate the number change with a smooth transition effect
2. WHEN odds increase THEN the system SHALL briefly highlight the value with a positive color indicator
3. WHEN odds decrease THEN the system SHALL briefly highlight the value with a neutral color indicator
4. WHEN the animation completes THEN the system SHALL return to the standard color scheme

### Requirement 4

**User Story:** As a user, I want the real-time odds feature to work efficiently without impacting the performance of the application, so that my betting experience remains smooth.

#### Acceptance Criteria

1. WHEN multiple game cards are displayed THEN the system SHALL optimize API calls to avoid redundant requests
2. WHEN a game card is not visible THEN the system SHALL pause real-time updates for that card
3. WHEN the user navigates away from the game cards THEN the system SHALL stop all real-time update intervals
4. WHEN real-time updates are active THEN the system SHALL not cause memory leaks or performance degradation

### Requirement 5

**User Story:** As a user, I want the real-time odds to only appear on upcoming rounds where I can still place bets, so that I'm not distracted by irrelevant information.

#### Acceptance Criteria

1. WHEN viewing a live game card THEN the system SHALL continue to show static odds calculated from current round data
2. WHEN viewing an ended game card THEN the system SHALL show final odds without real-time updates
3. WHEN viewing an upcoming game card THEN the system SHALL show real-time updating odds with 15-second refresh intervals
4. WHEN a round transitions from upcoming to live THEN the system SHALL stop real-time updates and switch to static display