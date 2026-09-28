<?php
/* Set e-mail recipient */
$myemail  = 'komalthakre146@gmail.com';
$subject = 'Inquiry form'; 
/* Check all form inputs using check_input function */
$yourname = check_input($_POST['name']);
$email  = check_input($_POST['email']);
$phone = check_input($_POST['phone']);
$message = check_input($_POST['message']);





/* Let's prepare the message for the e-mail */
$message = "Hello!

Your Inquiry form has been submitted by:

Name: $yourname
E-mail: $email
Mobile No.:$phone
Message:$message


";

/* Send the message using mail() function */
mail($myemail, $subject, $message);

/* Redirect visitor to the thank you page */
header('Location: thanks.html');
exit();

/* Functions we used */
function check_input($data, $problem='')
{
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    if ($problem && strlen($data) == 0)
    {
        show_error($problem);
    }
    return $data;
}

function show_error($myError)
{
?>
    <html>
    <body>

    <b>Please correct the following error:</b><br />
    <?php echo $myError; ?>

    </body>
    </html>
<?php
exit();
}
?>