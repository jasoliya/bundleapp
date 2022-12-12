import { RangeSlider } from "@shopify/polaris";

export function RangeSelector(props) {
    return (
        <RangeSlider
            label={props.label}
            min={props.min}
            max={props.max}
            step={props.step}
            value={props.range}
            suffix={<p style={{ minWidth: '38px', textAlign: 'right' }}>{props.range} px</p>}
            onChange={(value) => props.changeRange(value)}
        />
    );
}