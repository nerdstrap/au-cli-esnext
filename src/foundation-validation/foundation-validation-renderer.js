import {ValidationRenderer, RenderInstruction, ValidationError} from 'aurelia-validation';

if (window.Element && !Element.prototype.closest) {
    Element.prototype.closest =
        function (s) {
            let matches = (this.document || this.ownerDocument).querySelectorAll(s);
            let i;
            let el = this;
            do {
                i = matches.length;
                while (--i >= 0 && matches.item(i) !== el) {
                }
            } while ((i < 0) && (el = el.parentElement));
            return el;
        };
}

const abideLabels = false;

export class FoundationValidationRenderer {
    render(instruction) {
        for (let {result, elements} of instruction.unrender) {
            for (let element of elements) {
                FoundationValidationRenderer.remove(element, result);
            }
        }

        for (let {result, elements} of instruction.render) {
            for (let element of elements) {
                FoundationValidationRenderer.add(element, result);
            }
        }
    }

    static add(element, result) {
        const formRow = element.closest('.form-row');
        if (!formRow) {
            return;
        }

        const formLabel = formRow.getElementsByTagName('label')[0];
        const formInput = formRow.getElementsByTagName('input')[0];
        if (result.valid) {
            if (abideLabels && formLabel && !formLabel.classList.contains('is-invalid-label')) {
                formLabel.classList.add('is-valid-label');
            }

            if (formInput && !formInput.classList.contains('is-invalid-input')) {
                formInput.classList.add('is-valid-input');
            }
        } else {
            if (abideLabels && formLabel) {
                formLabel.classList.remove('is-valid-label');
                formLabel.classList.add('is-invalid-label');
            }

            if (formInput) {
                formInput.classList.remove('is-valid-input');
                formInput.classList.add('is-invalid-input');
                formInput.setAttribute('aria-invalid', 'true');
            }

            const message = document.createElement('span');
            message.className = 'form-error is-visible';
            message.textContent = result.message;
            message.id = `validation-message-${result.id}`;
            formRow.appendChild(message);
        }
    }

    static remove(element, result) {
        const formRow = element.closest('.form-row');
        if (!formRow) {
            return;
        }

        const formLabel = formRow.getElementsByTagName('label')[0];
        const formInput = formRow.getElementsByTagName('input')[0];

        if (result.valid) {
            if (abideLabels && formLabel) {
                formLabel.classList.remove('is-valid-label');
            }

            if (formInput) {
                formInput.classList.remove('is-valid-input');
            }
        } else {
            if (abideLabels && formLabel) {
                formLabel.classList.remove('is-invalid-label');
            }

            if (formInput) {
                formInput.classList.remove('is-invalid-input');
                formInput.setAttribute('aria-invalid', 'false');
            }

            const message = formRow.querySelector(`#validation-message-${result.id}`);
            if (message) {
                formRow.removeChild(message);
            }
        }
    }
}
