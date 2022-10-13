let bundle_button = document.querySelector('[data-add-bundle]');

if(bundle_button != null) {
    bundle_button.addEventListener('click', function(){
        if(this.disabled) return;
        
        fetch('/front/api/order', {
            method: 'GET'
        })
        .then(function(response) { return response.json(); })
        .then(function(response) {
            console.log(response);
        });
    });
}