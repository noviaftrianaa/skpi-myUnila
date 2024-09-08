<script type="text/javascript">
    function generateRandomColor() {
        const hue = Math.floor(Math.random() * 360);
        const saturation = Math.floor(Math.random() * 40) + 60;
        const lightness = Math.floor(Math.random() * 30) + 40;
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }


    function generateRandomColors(numberOfColors) {
        const colors = [];
        for (let i = 0; i < numberOfColors; i++) {
            colors.push(generateRandomColor());
        }
        return colors;
    }

</script>
