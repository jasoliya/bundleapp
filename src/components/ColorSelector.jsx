export function ColorSelector(props) {
    return (
        <div>
            <div className="Polaris-Labelled__LabelWrapper">
                <div className="Polaris-Label">
                    <label className="Polaris-Label__Text">{props?.label || 'Color'}</label>
                </div>
            </div>
            <div className="ColorPicker">
                <input id={props.for} type="color" value={props.color} onChange={(e) => props.changeColor(e.target.value)} />
                <label htmlFor={props.for}>{props.color}</label>
            </div>
        </div>
    );
}