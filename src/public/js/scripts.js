jQuery("#forgot-password").on("submit", function (e) {
  e.preventDefault();
  var email = jQuery("#emailInput").val();
  const data = {
    email: email,
  };
  jQuery.ajax({
    type: "POST",
    url: "http://localhost:8000/admin/forgot-password",
    dataType: "json",
    contentType: "application/json",
    data: JSON.stringify(data),
    success: function (response) {
      jQuery("#emailInput").val("");
      showMessage(response.message, true);
    },
    error: function (response) {
      showMessage(response.responseJSON.message, false);
    },
  });
});

jQuery("#reset-password").on("submit", function (e) {
  e.preventDefault();
  var newPassword = jQuery("#newPasswordInput").val();
  var confirmPassword = jQuery("#confirmPasswordInput").val();
  var token = jQuery("#passwordResetToken").val();
  if (!isValidPassword(newPassword)) {
    showMessage(
      "Must contain: 8 or more characters, 1 uppercase, 1 lowercase, 1 number, 1 special character.",
      false
    );
    return;
  }
  if (newPassword === confirmPassword) {
    const data = {
      password: newPassword,
      token: token,
    };
    jQuery.ajax({
      type: "POST",
      url: "http://localhost:8000/admin/reset-password",
      dataType: "json",
      contentType: "application/json",
      data: JSON.stringify(data),
      success: function (response) {
        if (response.statusCode == 200) {
          jQuery(".form-container").html(
            "<h6 class = 'text-start' > " + response.message + " </h6>"
          );
        }
      },
      error: function (response) {},
    });
  } else {
    showMessage("The new and confirm passwords do not match.", false);
    return;
  }
});

function isValidPassword(password) {
  pattern = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s)(?=.*[!@#$*])/;
  return pattern.test(password);
}

function showMessage(message, messageType) {
  if (messageType === true) {
    jQuery(".message")
      .removeClass("alert-danger d-none")
      .addClass("alert-success d-block")
      .text(message)
      .delay(3000)
      .fadeOut("slow", function () {
        jQuery(this).addClass("d-none").text("");
      });
  } else {
    jQuery(".message")
      .removeClass("alert-success d-none")
      .addClass("alert-danger d-block")
      .text(message)
      .delay(3000)
      .fadeOut("slow", function () {
        jQuery(this).addClass("d-none").text("");
      });
    jQuery("#emailInput").trigger("focus");
  }
}
