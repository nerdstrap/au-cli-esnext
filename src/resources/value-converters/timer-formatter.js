import numbro from 'numbro';

export class TimerFormatterValueConverter {
    toView(value) {
        if (value === '0') {
            return 'Invalid time';
        } else {
            let formattedValue = numbro(value).format('0:0');
            return formattedValue.substring(formattedValue.length - 5, formattedValue.length);
        }
    }
}
