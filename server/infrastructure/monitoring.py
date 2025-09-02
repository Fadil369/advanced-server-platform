class MetricsCollector:
    def __init__(self):
        self.metrics = {}
    
    def collect_metric(self, name: str, value: float):
        self.metrics[name] = value
    
    def get_metrics(self):
        return self.metrics
