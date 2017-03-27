export class ChallengeQuestionAnswer {
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
            if (response.userAnswerText) {
                this.userAnswerText = response.userAnswerText;
            }
        }
    }
}
