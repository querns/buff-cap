function calculateTotalBuffs() {
    const buffCountContainer = $("#buff-count-container");

    let count = 0;
    let badgeClass = "badge-success";
    let selectedBuffs = [];
    let colorBlindBadge;

    $("input[type='checkbox']").each((index, element) => {
        if ($(element).prop("checked")) {
            count++;

            const id = $(element).prop("id");
            const match = id.match(/spell-(\d+)/);
            if (match) {
                selectedBuffs.push(match[1]);
            }
        }
    });
    $("input[type='hidden']").each((index, element) => {
        const id = $(element).prop("id");
        const match = id.match(/spell-(\d+)/);
        const stackingCount = parseInt($(element).val());

        if (!match || isNaN(stackingCount)) {
            return;
        }

        count += stackingCount;
        for (let i = 0; i < stackingCount; i++) {
            selectedBuffs.push(match[1]);
        }
    });

    buffCountContainer.tooltip("dispose");
    if (count >= 28 && count < 32) {
        badgeClass = "badge-warning";
        colorBlindBadge = "#buff-count-warning";
        buffCountContainer.tooltip({
            title: "You're close to the buff cap of 32.",
            html: true,
            placement: "bottom",

        })
    } else if (count === 32) {
        badgeClass = "badge-danger";
        colorBlindBadge = "#buff-count-warning";
        buffCountContainer.tooltip({
            title: "Being exactly at the buff cap is dangerous.<br />If any of your buffs are overwritten by another player, it causes both buffs to apply for one batch, temporarily pushing you to 33.",
            html: true,
            placement: "bottom",
        });
    } else if (count >= 32) {
        badgeClass = "badge-danger";
        colorBlindBadge = "#buff-count-danger";
        buffCountContainer.tooltip({
            title: "You're over the buff cap of 32.",
            html: true,
            placement: "bottom",
        });
    }

    buffCountContainer.removeClass("badge-success badge-warning badge-danger").addClass(badgeClass)
    $("#total-buff-count").text(count);
    $("[data-color-blind-help]").addClass("hidden");
    $(colorBlindBadge).removeClass("hidden");

    if (selectedBuffs.length > 0) {
        const bytes16 = new Uint16Array(selectedBuffs.sort());
        const bytes8 = new Uint8Array(bytes16.buffer);
        let binary = "";
        for (let i = 0; i < bytes8.byteLength; i++) {
            binary += String.fromCharCode( bytes8[i] );
        }
        let hash = btoa(binary);
        hash = hash.replace(/\+/g, '-');
        hash = hash.replace(/\//g, '_');

        history.replaceState(null, null, `#${hash}`);
    } else {
        history.replaceState(null, null, "#");
    }
}

function calculateSubSection(currentTarget) {
    const selectedBuffs = $(currentTarget).closest("ul").find("input[type='checkbox']:checked");
    const summary = $(currentTarget).closest(".has-buff-count").find(".buff-summary");
    $(currentTarget)
        .closest(".has-buff-count")
        .find(".buff-count").text(selectedBuffs.length === 0 ? "" : selectedBuffs.length);

    $(summary).tooltip("dispose");
    $(summary).empty();
    $(selectedBuffs).each((index, element) => {
        $(element).closest("li")
            .find("a:not(:has(img[data-info])):not([data-info])")
            .clone(true)
            .appendTo(summary);
    });
    $(summary).find("a").data("toggle", "tooltip").tooltip();
}

function loadBuffsFromURL() {
    let hash = window.location.hash;
    if (hash.length > 0) {
        hash = hash.replace(/-/g, "+");
        hash = hash.replace(/_/g, "/");
        hash = hash.replace(/#/g, "");
        const raw = atob(hash);
        const rawLength = raw.length;
        const int8Array = new Uint8Array(new ArrayBuffer(rawLength));

        for (let i = 0; i < rawLength; i++) {
            int8Array[i] = raw.charCodeAt(i);
        }

        // If the page is refreshed, input values are carried over, causing duplication of stackable buffs.
        $("input[type='hidden']").val(0);

        const int16Array = new Uint16Array(int8Array.buffer);
        int16Array.forEach(buff => {
            if (buff === 20034) {
                // Backwards compatibility for Crusader.
                buff = 20007;
            } else if (buff === 24658) {
                // Backwards compatibility for Trinket 1 and 2.
                buff = 24427;
            }

            const spellInput = $(`#spell-${buff}`);
            if (spellInput.is(":checkbox")) {
                spellInput.prop("checked", true);
            } else if (spellInput.is(":hidden")) {
                const newCount = parseInt(spellInput.val()) + 1;
                spellInput.val(newCount);
                spellInput.closest(".stacking-buff").find(".stacking-count").text(newCount);
            }
        });
        $(".has-buff-count").each((index, element) => {
            calculateSubSection($(element).find("input[type='checkbox']").first());
        });

        $("#personal-buffs .has-buff-count").has("input:checked").find(".collapse:not([data-info])").collapse("show");
    }
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

(() => {
    $("#clear-all").click(() => {
        $("input[type='checkbox']").prop("checked", false);
        $("input[type='hidden']").val(0);
        calculateTotalBuffs();
        $(".stacking-count").text("");
        $(".buff-count").text("");
        $(".buff-summary").empty();
    });

    $(".bc-cell-header button[data-clear-button]").click(e => {
        $(e.currentTarget).closest(".bc-cell")
            .find("input[type='checkbox']").prop("checked", false).end()
            .find(".buff-count").text("").end()
            .find(".buff-summary").empty().end()
            .find("input[type='hidden']").val(0).end()
            .find(".stacking-count").text("")
        ;

        if ($(e.currentTarget).closest(".bc-cell").attr("id") === "personal-buffs") {
            $("#personal-buffs .has-buff-count").find(".collapse").collapse("hide");
        }

        calculateTotalBuffs();
    });

    $(".buff-count").click(e => {
        $(e.currentTarget).closest(".has-buff-count")
            .find("input[type='checkbox']").prop("checked", false).end()
            .find(".buff-summary").empty();

        $(e.currentTarget).text("");
        calculateTotalBuffs();
    });

    $('[data-toggle="tooltip"]').tooltip();

    $("input[type='checkbox']").click(e => {
        const currentTarget = $(e.currentTarget);

        if (currentTarget.closest("#personal-buffs").length > 0) {
            const clickedClassType = $(e.currentTarget).closest("[data-class]").data("class");
            if (clickedClassType !== undefined) {
                const foreignPersonalBuffs = $(`#personal-buffs ul[data-class!='${clickedClassType}']`).find("input[type='checkbox']:checked")

                if (foreignPersonalBuffs.length > 0) {
                    foreignPersonalBuffs.prop("checked", false);
                    foreignPersonalBuffs.each((index, element) => calculateSubSection(element));
                    calculateTotalBuffs();
                    $("#buff-class-removed").text($(foreignPersonalBuffs).one().closest("[data-class]").data("class").toString().capitalize());
                    $("#buff-class-selected").text(clickedClassType.capitalize());
                    $("#personal-buff-toast").toast("show");
                }
            }

        }

        if (currentTarget.closest(".has-buff-count").length > 0) {
            calculateSubSection(e.currentTarget);
        }

        if (currentTarget.data("exclusive") !== undefined) {
            if (currentTarget.prop("checked")) {
                const category = currentTarget.data("exclusive");
                $(`input[data-exclusive='${category}']`).each((index, checkbox) => {
                    if (checkbox !== e.currentTarget) {
                        $(checkbox).prop("checked", false);
                    }
                });

                calculateSubSection(e.currentTarget);
            }
        }

        if (currentTarget.data("vanish") !== undefined) {
            const otherVanishInput = $("[data-vanish]").not(e.currentTarget);

            if (currentTarget.is(":checked")) {
                otherVanishInput.add("[data-stealth]").prop("checked", true);
            } else {
                otherVanishInput.prop("checked", false);
            }
        }

        if (currentTarget.data("stealth") !== undefined && !currentTarget.prop("checked")) {
            $("[data-vanish]").prop("checked", false);
        }

        calculateTotalBuffs();
    });

    function changeStackingBuffAmount(currentTarget, amount) {
        const input = $(currentTarget).closest(".stacking-buff").find("input[type='hidden']");
        const countElement = $(currentTarget).closest(".stacking-buff").find(".stacking-count");
        const maximum = $(input).data("maximum") || Number.MAX_SAFE_INTEGER;
        const newValue = Math.max(0, Math.min(parseInt(input.val()) + amount, maximum));

        countElement.text(newValue === 0 ? "" : newValue);
        input.val(newValue);
        calculateTotalBuffs();
    }

    $(".stacking-count, .stacking-buff label")
        .click(e => changeStackingBuffAmount(e.currentTarget, 1))
        .contextmenu(e => {
            changeStackingBuffAmount(e.currentTarget, -1);
            e.preventDefault();
            return false;
        })
        .tooltip({
            html: true,
            title: "This buff can be acquired multiple times.<br />Left click: Add 1<br />Right click: Subtract 1",
        });

    $(document).on("show.bs.collapse", (e) => {
        $(e.target).closest(".has-buff-count").find(".buff-summary").hide();
    });

    $(document).on("hide.bs.collapse", (e) => {
        $(e.target).closest(".has-buff-count").find(".buff-summary").show();
    });

    const clipboard = new Clipboard("#clipboard-button", {
        text: () => window.location.href,
    });
    clipboard.on("success", () => {
        $("#copy-toast").toast("show");
    });

    loadBuffsFromURL();
    calculateTotalBuffs();
})();