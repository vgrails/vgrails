function grid_data(rows, cols){
	var test_data2 = [];
	for (var i = 0; i < rows; i++){
		test_data2[i] = { };
		for (var j = 0; j < cols; j++)
		test_data2[i]["col"+j] = i+" - "+j;
	}
	return test_data2;
}

function grid_config(cols){
	var columns = [];
	for (var i = 0; i < cols/2; i++){
		columns.push({ id:"col"+i*2,   header:[{ text:"Col "+i, colspan:"2"}, "Sub "+i*2], footer:[{ rowspan:2, text:"Ftr "+i}]});
		columns.push({ id:"col"+(i*2+1), header:[null , "Sub "+(i*2+1) ], footer:["1","2"] });
	}
	columns[1].css = columns[0].css="startcol";
	columns[cols-1].css = columns[cols-2].css = "endcol";
	return columns;
}
			

function a_grid_data(size){
	var data = [];
	for (var i=0; i<size; i++)
		data[i] = { "a":i+".1", "b":i+".2", "c":i+".3", "d":i+".4", "e":i+".5"};
	return data;		
}

var small_test_matrix = a_grid_data(2);
var big_test_matrix =  a_grid_data(32);