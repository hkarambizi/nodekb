$(document).ready(function(){
    // attach event listener to delete button
    $('.delete-article').on('click', function(e){
        // this is a jquery variable
        $target = $(e.target);
        const id = $target.attr('data-id');

        $.ajax({
            type: 'DELETE',
            url: '/articles/' + id,
            success: function(response){
                alert('Deleting Article');
                window.location.href='/';
            },
            error: function(err){
                console.log(err);
            }
        })

    })
})