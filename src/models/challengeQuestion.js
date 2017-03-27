export class ChallengeQuestion {
    challengeQuestionId = '';
    challengeQuestionText = '';
    userAnswerText = '';

    constructor() {
    }

    fromJson(response) {
        if (response) {
            if (response.challengeQuestionId) {
                this.challengeQuestionId = response.challengeQuestionId;
            }
            if (response.challengeQuestionText) {
                this.challengeQuestionText = response.challengeQuestionText;
            }
        }
    }
}
