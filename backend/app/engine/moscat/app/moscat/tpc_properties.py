class _TPCProperties:
    def __init__(
        self,
        snapshot_quality,
        temporal_quality,
        input_parameters,
        groups,
        output_parameters=[],
    ):
        self.temporal_quality = temporal_quality
        self.snapshot_quality = snapshot_quality
        self.input_parameters = input_parameters
        self.output_parameters = output_parameters
        self.groups = groups

    def __eq__(self, step_parameter_set):
        return (
            self.snapshot_quality == step_parameter_set.snapshot_quality
            and self.temporal_quality == step_parameter_set.temporal_quality
        )

    def __repr__(self):
        return str(
            {
                "temporal_quality": self.temporal_quality,
                "snapshot_quality": self.snapshot_quality,
                "input_parameters": self.input_parameters,
                "output_parameters": self.output_parameters,
                "groups": "[available]",
            }
        )

    def __iter__(self):
        yield "temporal_quality", self.temporal_quality
        yield "snapshot_quality", self.snapshot_quality
        yield "input_parameters", self.input_parameters
        yield "output_parameters", self.output_parameters
        yield "groups", self.groups
