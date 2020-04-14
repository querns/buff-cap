(() => {
    const calculateTotalBuffs = () => {
        const badge = $("#total-buff-count");
        let count = 0;
        let badgeClass = "badge-success";

        $("input[type='checkbox']").each((index, element) => {
            if ($(element).prop("checked")) {
                count++;
            }
        });

        if (count >= 28) {
            badgeClass = "badge-warning";
        }

        if (count >= 32) {
            badgeClass = "badge-danger";
        }

        badge.removeClass("badge-success badge-warning badge-danger").addClass(badgeClass).text(count);
    };

    $(".bc-cell-header button").click(e => {
        $(e.currentTarget).closest(".bc-cell").find("input[type='checkbox']").prop("checked", false);
        calculateTotalBuffs();
    });

    $(".buff-count").click(e => {
        $(e.currentTarget).closest(".has-buff-count").find("input[type='checkbox']").prop("checked", false);
        $(e.currentTarget).text("");
        calculateTotalBuffs();
    });

    function calculateSubSection(currentTarget) {
        const buffCount = $(currentTarget).closest("ul").find("input[type='checkbox']:checked").length;
        $(currentTarget).closest(".has-buff-count").find(".buff-count").text(buffCount === 0 ? "" : buffCount);
    }

    $(".has-buff-count input[type='checkbox']").click(e => calculateSubSection(e.currentTarget));

    $('[data-toggle="tooltip"]').tooltip();

    $("input[data-exclusive]").click(e => {
        if ($(e.currentTarget).prop("checked")) {
            const category = $(e.currentTarget).data("exclusive");
            $(`input[data-exclusive='${category}']`).each((index, checkbox) => {
                if (checkbox !== e.currentTarget) {
                    $(checkbox).prop("checked", false);
                }
            });

            calculateSubSection(e.currentTarget);
        }
    });

    $("input[type='checkbox']").click(calculateTotalBuffs);
    calculateTotalBuffs();
})();