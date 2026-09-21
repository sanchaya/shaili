jQuery("#sign-up").on("submit", function (e) {
    e.preventDefault();
    var email = jQuery("#emailInput").val();
    var name = jQuery("#nameInput").val();
    var role = jQuery("#roleInput").val();
    var newPassword = jQuery("#newPasswordInput").val();
    var confirmPassword = jQuery("#confirmPasswordInput").val();

    jQuery(".error").text("");

    if (!validateEmail(email) || !email) {
        jQuery(".error.emailInput")
            .removeClass("d-none")
            .text("Enter valid email address");
    }

    if (!name) {
        jQuery(".error.nameInput")
            .removeClass("d-none")
            .text("Enter your name");
    }

    if (!role) {
        jQuery(".error.roleInput")
            .removeClass("d-none")
            .text("Select an account type");
    }

    if (!newPassword) {
        jQuery(".error.newPasswordInput")
            .removeClass("d-none")
            .text("Enter new password");
    }

    if (!confirmPassword) {
        jQuery(".error.confirmPasswordInput")
            .removeClass("d-none")
            .text("Enter new password again");
    }

    if (!email || !name || !role || !newPassword || !confirmPassword) {
        return;
    }

    if (!isValidPassword(newPassword)) {
        showMessage(
            "Must contain: 8 or more characters, 1 uppercase, 1 lowercase, 1 number, 1 special character.",
            false
        );
        return;
    }

    if (newPassword !== confirmPassword) {
        showMessage("The new and confirm passwords do not match.", false);
        return;
    }

    const data = {
        name: name,
        email: email,
        password: newPassword,
        role: parseInt(role),
    };
    jQuery.ajax({
        type: "POST",
        url: BASE_URL + "/signup",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(data),
        success: function (response) {
            if (response.statusCode == 200) {
                jQuery("#emailInput").val("");
                jQuery("#nameInput").val("");
                jQuery("#newPasswordInput").val("");
                jQuery("#confirmPasswordInput").val("");
                jQuery(".error").addClass("d-none").text("");
                showMessage(response.message, true);
            }
        },
        error: function (response) {
            showMessage(response.responseJSON.message, false);
        },
    });
});

jQuery("#forgot-password").on("submit", function (e) {
    e.preventDefault();
    var email = jQuery("#emailInput").val();
    if (!validateEmail(email) || !email) {
        jQuery(".error")
            .removeClass("d-none")
            .text("Enter valid email address");
    } else {
        const data = {
            email: email,
        };
        jQuery.ajax({
            type: "POST",
            url: BASE_URL + "/forgot-password",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function (response) {
                jQuery("#emailInput").val("");
                jQuery(".error").addClass("d-none").text("");
                showMessage(response.message, true);
            },
            error: function (response) {
                jQuery(".error").addClass("d-none").text("");
                showMessage(response.responseJSON.message, false);
            },
        });
    }
});

jQuery("#reset-password").on("submit", function (e) {
    e.preventDefault();
    var newPassword = jQuery("#newPasswordInput").val();
    var confirmPassword = jQuery("#confirmPasswordInput").val();
    var token = jQuery("#passwordResetToken").val();
    jQuery(".error").text("");
    if (!newPassword) {
        jQuery(".error.newPasswordInput")
            .removeClass("d-none")
            .text("Enter new password.");
    }

    if (!confirmPassword) {
        jQuery(".error.confirmPasswordInput")
            .removeClass("d-none")
            .text("Enter new password again.");
    }

    if (!newPassword || !confirmPassword) {
        return;
    }

    if (!isValidPassword(newPassword)) {
        showMessage(
            "Must contain: 8 or more characters, 1 uppercase, 1 lowercase, 1 number, 1 special character.",
            false
        );
        return;
    }

    if (newPassword !== confirmPassword) {
        showMessage("The new and confirm passwords do not match.", false);
        return;
    }

    const data = {
        password: newPassword,
        token: token,
    };
    jQuery.ajax({
        type: "POST",
        url: BASE_URL + "/reset-password",
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
        error: function (response) {
            showMessage(response.responseJSON.message, false);
        },
    });
});

function isValidPassword(password) {
    const pattern =
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[~`!@#$%^&*()-_+={}[\]|\\:;"'<>,.?/]).{8,}$/;
    return pattern.test(password);
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showMessage(message, messageType) {
    const messageElement = jQuery(".message");
    const closeButton = messageElement.find(".btn-close").detach();
    messageElement.empty();
    if (messageType === true) {
        jQuery(".message")
            .removeClass("alert-danger d-none")
            .addClass("alert-success d-block")
            .append(message)
            .append(closeButton);
    } else {
        jQuery(".message")
            .removeClass("alert-success d-none")
            .addClass("alert-danger d-block")
            .append(message)
            .append(closeButton);
        jQuery("#emailInput").trigger("focus");
    }
}

function handleScreenWidth() {
    const screenWidth = window.innerWidth;

    const minWidth769 = `
        @media screen and (min-width: 769px) {
            .sectionRight {
                width: 480px;
            }
            .sectionLeft {
                display: block;
            }
            .sectionInnerWrap {
                width: auto;
            }
        }
    `;

    const minWidth577 = `
        @media screen and (min-width: 577px) {
            .sectionLeft {
                display: none;
            }
            .sectionInnerWrap {
                width: 66.6667%;
            } 
        }
    `;

    if (screenWidth >= 769) {
        jQuery("#dynamicStyles").text(minWidth769);
    } else if (screenWidth >= 577 && screenWidth <= 768) {
        jQuery("#dynamicStyles").text(minWidth577);
    }
}

handleScreenWidth();

window.addEventListener("resize", handleScreenWidth);
