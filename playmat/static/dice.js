import DiceBox from "./dice-box-threejs.es.js";

const Box = new DiceBox('#rollWindow', {
	theme_customColorset: {
		background: "#29cbf0",
		foreground: "#ffffff",
		texture: "marble", // marble | ice
		material: "metal" // metal | glass | plastic | wood
	},
	light_intensity: 1,
	gravity_multiplier: 600,
	baseScale: 130,
	strength: 2,
	onRollComplete: (results) => {
		//console.log("I've got results :>> ", results);
		setTimeout(() => {
			$('#rollWindow').fadeOut('slow');
		}, 2000);
	},
	startRoll: (param) => { 
		Box.clearDice();
		$('#rollWindow').fadeIn('slow', () => {
			Box.roll(param)
		});
	}
});

Box.initialize().then(() => {
	$('#rollWindow').hide();
});
window.box = Box ;
