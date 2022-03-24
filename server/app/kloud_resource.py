class KloudResource:
    def __init__(self, resource_type: str):
        self._resource_type = resource_type
        self._metadata = dict()

    def get_type(self):
        return self._resource_type

    def get_info(self):
        pass

    def get_VPC(self):
        pass

    def get_AZ(self):
        pass

    def get_parents(self):
        pass

    def get_children(self):
        pass

    def get_metadata(self):
        return self._metadata


class KloudAZ(KloudResource):
    pass


class KloudVPC(KloudResource):
    pass


class KloudSubnet(KloudResource):
    pass


class KloudIGW(KloudResource):
    pass


class KloudNGW(KloudResource):
    pass


class KloudEC2(KloudResource):
    pass
