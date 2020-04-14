(() => {
    $(".bc-cell-header button").click(e => {
        $(e.currentTarget).closest(".bc-cell").find("input[type='checkbox']").prop("checked", false);
    });
    $(".buff-count").click(e => {
        $(e.currentTarget).closest(".has-buff-count").find("input[type='checkbox']").prop("checked", false);
        $(e.currentTarget).text("");
    });
    $(".has-buff-count input[type='checkbox']").click(e => {
        const buffCount = $(e.currentTarget).closest("ul").find("input[type='checkbox']:checked").length;
        $(e.currentTarget).closest(".has-buff-count").find(".buff-count").text(buffCount === 0 ? "" : buffCount);

    });
})();