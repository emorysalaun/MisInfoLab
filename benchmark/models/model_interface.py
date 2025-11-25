class ModelInterface:
    """
    Base interface for any model used in the misinformation benchmark.
    Every model must implement these two methods.
    """

    def generate_misinformation(self, headline: str) -> str:
        """
        Given a real headline, return a manipulated/misinformation headline.
        """
        raise NotImplementedError

    def score_misinformation(self, headline: str) -> float:
        """
        Given a headline, return a misinformation score between 0 and 1.
        """
        raise NotImplementedError

    @property
    def name(self):
        """
        Short name of the model. Used internally.
        """
        return self.__class__.__name__
